# -*-coding:utf-8 -*-

from __future__ import unicode_literals
import datetime
import json
from collections import OrderedDict
from django.db import transaction
from drf_yasg import openapi
from drf_yasg.utils import swagger_auto_schema
from rest_framework import filters, status
from rest_framework.authentication import SessionAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.serializers import Serializer
from django.db.models import Count, Q
from django_filters.rest_framework import DjangoFilterBackend
import re
from rest_framework.viewsets import GenericViewSet, ModelViewSet
from rest_framework.views import APIView
from rest_framework.mixins import (
    CreateModelMixin,
    ListModelMixin,
    DestroyModelMixin,
    RetrieveModelMixin,
    UpdateModelMixin
)

from my_exam.api.serializers import (
    MyExamListSerializer,
    ExamParticipantAnswerSerializer,
    ExamTaskSerializer
)
from my_exam.utils import datetime_to_timestamp
from exam_paper.models import (
    ExamTask,
    ExamParticipant,
    ExamPaperProblemsSnapShot,
    ExamParticipantAnswer,
    PAPER_CREATE_TYPE,
    TASK_STATE,
)
from exam_paper.utils import response_format

DUPLICATE_SUFFIX = '(copy)'

page = openapi.Parameter(
    'page',
    openapi.IN_QUERY,
    description="page number",
    type=openapi.TYPE_INTEGER
)
page_size = openapi.Parameter(
    'page_size',
    openapi.IN_QUERY,
    description="page size",
    type=openapi.TYPE_INTEGER
)
search = openapi.Parameter(
    'search',
    openapi.IN_QUERY,
    description="search text",
    type=openapi.TYPE_STRING
)
problem_type = openapi.Parameter(
    'problem_type',
    openapi.IN_QUERY,
    description="problem type filter ",
    type=openapi.TYPE_INTEGER
)
section_id = openapi.Parameter(
    'section_id',
    openapi.IN_QUERY,
    description="section id",
    type=openapi.TYPE_STRING
)

fix_exampaper = openapi.Schema(
    title='name',
    type=openapi.TYPE_OBJECT,
    properties={
        'name': openapi.Schema(type=openapi.TYPE_STRING, example="Middle Exam"),
        'description': openapi.Schema(type=openapi.TYPE_STRING, example="Middle Exam"),
        'passing_ratio': openapi.Schema(type=openapi.TYPE_INTEGER, example=60),
        'problems': openapi.Schema(
            type=openapi.TYPE_ARRAY,
            items=openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties={
                    'sequence': openapi.Schema(type=openapi.TYPE_STRING, example=5),
                    'problem_id': openapi.Schema(type=openapi.TYPE_STRING, example='hello+hello+20180101+type@problem+block@915e0a76b7aa457f8cf616284bbfba32'),
                    'problem_type': openapi.Schema(type=openapi.TYPE_STRING, example='choiceresponse'),
                    'grade': openapi.Schema(type=openapi.TYPE_INTEGER, example=5),
                    'content': openapi.Schema(type=openapi.TYPE_OBJECT, properties={}),
                },
                required=['grade', 'problem_id']
            )
        )
    },
    required=['name', 'problems', 'passing_ratio']
)


class MyExamViewSet(RetrieveModelMixin, ListModelMixin, CreateModelMixin, GenericViewSet):
    """
    retrieve: 我的考试接口

    list: 我的考试列表接口
    * 分页，默认单页 10 条记录
    * 排序，默认按开考时间、降序排序， /api/my_exam/my_exam?ordering=period_start
    * 搜索，按「考试任务名称」搜索，/api/my_exam/my_exam?ordering=period_start&search=<exam task title>&task_state=pending
    * 权限，只能看到自己的考试任务
    """
    # authentication_classes = (
    #     SessionAuthentication,
    # )
    # permission_classes = (
    #     IsAuthenticated,
    # )

    serializer_class = MyExamListSerializer
    filter_backends = (filters.SearchFilter, filters.OrderingFilter, DjangoFilterBackend,)
    filter_fields = ('task_state',)
    search_fields = ('exam_task__name',)
    ordering_fields = ('exam_task__period_start', 'hand_in_time')
    ordering = ('exam_task__period_start',)

    def get_queryset(self):
        user = self.request.user
        return ExamParticipant.objects.filter(participant=user)

    def retrieve(self, request, *args, **kwargs):
        my_exam = self.get_object()
        serializer = MyExamListSerializer(my_exam)

        res_data = serializer.data
        res_data["pending"] = 10
        return Response(res_data)

    @swagger_auto_schema(manual_parameters=[page, page_size])
    def list(self, request, *args, **kwargs):
        queryset_state = self.get_queryset()
        # 先更新一下状态
        queryset_state_update = self.update_exam_result(queryset_state)
        state_count = {
            'started': 0,
            'finished': 0,
            'unavailable': 0,
            'pending': 0,
            'all_count': 0,
            'current_time': datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        }
        state_count.update(queryset_state_update.filter(task_state=TASK_STATE[0][0]).aggregate(pending=Count('pk')))
        state_count.update(queryset_state_update.filter(task_state=TASK_STATE[1][0]).aggregate(started=Count('pk')))
        state_count.update(queryset_state_update.filter(task_state=TASK_STATE[2][0]).aggregate(finished=Count('pk')))
        state_count.update(queryset_state_update.filter(task_state=TASK_STATE[3][0]).aggregate(unavailable=Count('pk')))
        state_count.update(queryset_state_update.filter().aggregate(all_count=Count('pk')))
        # queryset_state_update
        if request.GET.get('ordering') is None and request.GET.get('task_state') is None:
            queryset_tmp = self.filter_queryset(queryset_state_update)
            queryset = sorted(queryset_tmp, key=lambda x: (x.task_state == TASK_STATE[2][0],
                                                           x.task_state == TASK_STATE[0][0],
                                                           x.task_state == TASK_STATE[1][0]))
        else:
            queryset = self.filter_queryset(queryset_state_update)
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            assert self.paginator is not None
            return self.paginator.get_paginated_response(serializer.data, **state_count)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    def update_exam_result(self, queryset):
        """
        更新我的考试状态
        即将开始的考试=考试时间还未到考试时间
        正在进行中的考试=当前日期在考试期限内，并且还没有交卷的考试任务。
        已完成的考试=当前日期在考试期限内，并且已经交卷的考试任务
        :return:
        """
        exam_tasks = ExamTask.objects.filter()
        try:
            for item in queryset:
                exam_task_id = item.exam_task_id
                exam_task = exam_tasks.filter(id=exam_task_id).first()
                if exam_task:
                    if datetime_to_timestamp(datetime.datetime.now()) < datetime_to_timestamp(exam_task.period_start):
                        item.task_state = TASK_STATE[0][0]
                    elif datetime_to_timestamp(datetime.datetime.now()) >= datetime_to_timestamp(exam_task.period_end):
                        item.task_state = TASK_STATE[2][0]
                    else:
                        if item.task_state != TASK_STATE[2][0]:
                            item.task_state = TASK_STATE[1][0]
                    item.save()
        except Exception as ex:
            pass

        return self.get_queryset()

    def create(self, request, *args, **kwargs):
        """
        参加考试
        :param request:
        :param args:
        :param kwargs:
        :return:
        """
        participant_id = request.data['participant_id']
        exam_participant, exam_task = self.get_exam_participant(participant_id)
        if exam_participant and exam_task:
            if exam_task.exampaper_create_type == PAPER_CREATE_TYPE[0][0]:
                # 固定考试生成试卷
                snapshot_list = ExamPaperProblemsSnapShot.objects.filter(exam_task_id=exam_task.id)
            else:
                snapshot_list = []
            with transaction.atomic():
                for problem in snapshot_list:
                    exam_participant_answer = ExamParticipantAnswer.objects.filter(
                        participant=exam_participant,
                        sequence=problem.sequence,
                        problem_type=problem.problem_type
                    ).first()
                    if exam_participant_answer:
                        serializer = ExamParticipantAnswerSerializer(ExamParticipantAnswer.objects.filter(participant_id=participant_id), many=True)
                        return Response(response_format(serializer.data))
                    else:
                        ExamParticipantAnswer.objects.create(
                            participant=exam_participant,
                            sequence=problem.sequence,
                            problem_type=problem.problem_type,
                            content=problem.content,
                            answer='',
                            grade=0,
                            problem_grade=problem.grade,
                            operate_at=datetime.datetime.now()
                        )
            serializer = ExamParticipantAnswerSerializer(ExamParticipantAnswer.objects.filter(participant_id=participant_id), many=True)

            return Response(response_format(serializer.data))
        else:
            return Response(response_format(msg='考试任务不存在'))

    def get_exam_participant(self, participant_id):
        """
        获取考试任务信息
        :param participant_id:
        :return:
        """
        exam_participant = ExamParticipant.objects.filter(id=participant_id).first()

        if not exam_participant:
            raise
        exam_task_id = exam_participant.exam_task_id
        try:
            exam_task = ExamTask.objects.get(id=exam_task_id)
        except Exception as ex:
            exam_task = None
        return exam_participant, exam_task


class ExamParticipantAnswerViewSet(RetrieveModelMixin, ListModelMixin,
                                   UpdateModelMixin, DestroyModelMixin, GenericViewSet):
    """
    ```
    {
        "exam_task": '',
        "participant": '',
        "answer": '',
        "grade": '',
        "sequence": '',
        "problem_type": '',
        "content": '',
        "operate_at": '',
    }
    ```
    """

    # authentication_classes = (
    #     SessionAuthentication,
    # )
    # permission_classes = (
    #     IsAuthenticated,
    # )
    serializer_class = ExamParticipantAnswerSerializer

    def get_queryset(self):
        """
        获得考试答卷
        :param participant_id:
        :return:
        """
        try:
            participant_id = int(str(self.request.GET.get('participant_id')))
            return ExamParticipantAnswer.objects.filter(participant_id=participant_id)
        except Exception as ex:
            return ExamParticipantAnswer.objects.filter(participant_id=0)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    def list(self, request, *args, **kwargs):
        try:
            participant_id = int(str(self.request.GET.get('participant_id')))
        except Exception as ex:
            participant_id = 0
        queryset = self.filter_queryset(self.get_queryset())

        serializer = self.get_serializer(queryset, many=True)
        if len(serializer.data) == 0:
            return Response(response_format(data=serializer.data, msg='考试未开始'))
        else:
            exam_participant = ExamParticipant.objects.filter(id=participant_id).first()
            if exam_participant:
                if exam_participant.task_state == TASK_STATE[1][0]:
                    # 正在考试中
                    common_info = self.get_exam_task_info(exam_participant)
                    data = self.get_started_data(serializer)
                    return self.get_return_response(data, **common_info)
                elif exam_participant.task_state == TASK_STATE[2][0]:
                    # 考试结束
                    common_info = self.get_exam_task_info(exam_participant)
                    data = self.get_finished_data(serializer)
                    return self.get_return_response(data, **common_info)
                else:
                    pass
            else:
                pass
            return Response(response_format(serializer.data))

    def update(self, request, *args, **kwargs):
        """
        更新所有
        """
        instance = self.get_object()
        return super(ExamParticipantAnswerViewSet, self).update(request, args, kwargs)

    def partial_update(self, request, *args, **kwargs):
        """
        更新部分
        """
        instance = self.get_object()
        return super(ExamParticipantAnswerViewSet, self).partial_update(request, args, kwargs)

    def get_serializer(self, *args, **kwargs):
        kwargs['partial'] = True
        return super(ExamParticipantAnswerViewSet, self).get_serializer(*args, **kwargs)

    def get_exam_task_info(self, exam_participant):
        """
        获取考试任务信息
        :return:
        """
        instance = ExamTask.objects.filter(id=exam_participant.exam_task_id).first()
        serializer = ExamTaskSerializer(instance)
        common_info = {
            'participant_id': exam_participant.id,
            'task_state': exam_participant.task_state,
            'current_time': datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
            'exam_task': serializer.data
        }
        if exam_participant.task_state == TASK_STATE[2][0]:
            common_info['total_grade'] = exam_participant.total_grade
        return common_info

    def get_return_response(self, data, **kwargs):
        """
        自定义格式化返回
        :param data:
        :param kwargs:
        :return:
        """
        result = [
            ('results', data),
        ]

        if kwargs:
            result += kwargs.items()

        return Response(response_format(OrderedDict(result)))

    def get_started_data(self, serializer):
        """
        获取考试中的题目
        :return:
        """
        data = []
        for item in serializer.data:
            item.pop('grade')
            if 'answers' in item['content'].keys():
                item['content'].pop('answers')
            if 'solution' in item['content'].keys():
                item['content'].pop('solution')
            data.append(item)
        return data

    def get_finished_data(self, serializer):
        """
        获取考试结束后的题目
        :return:
        """
        return serializer.data


class JudgmentAnswer(object):
    """
    判断答案是否正确
    """
    PROBLEM_TYPE = (
        ('multiplechoiceresponse', 'single_choice'),
        ('choiceresponse', 'multi_choice'),
        ('stringresponse', 'fill_in'),
    )
    AnswerDict = {
        'A': 0,
        'B': 1,
        'C': 2,
        'D': 3,
        'E': 4,
        'F': 5,
        'G': 6,
        'H': 7,
        'I': 8,
        'a': 0,
        'b': 1,
        'c': 2,
        'd': 3,
        'e': 4,
        'f': 5,
        'g': 6,
        'h': 7,
        'i': 8,

    }
    context = ""
    answer = ""

    def __init__(self, context, answer):
        self.context = context
        self.answer = answer

    def JudgmentSingleChoice(self):
        """
        判断单选题
        {
            "descriptions": {},
            "options": [
                "87.5%",
                "65%",
                "35%",
                "25%"
            ],
            "solution": "【解析】产出率=可用的65万部÷总数100万部。根据“该公司原计划投入800工时进行加工生产，实际上只用了700工时”得出的87.5%，是公司的实际产能利用率，不是产出率。",
            "answers": [
                1
            ],
            "title": "产出率=可用的65万部÷总数100万部。根据“该公司原计划投入800工时进行加工生产，实际上只用了700工时”得出的87.5%，是公司的实际产能利用率，不是产出率。"
        }
        :return:
        """
        try:
            if self.AnswerDict[self.answer] == self.StringToDict()['answers']:
                return True
            else:
                return False
        except Exception as ex:
            return False

    def JudgmentMultiChoice(self):
        """
        判断多选题
        {
            "descriptions": {},
            "options": [
                "它是确定产品生产过程各工艺阶段的投入和产出日期的一个时间标准，是保证各工艺阶段相互衔接和保证合同交货期的重要依据，所以它是成批生产作业计划的重要度量标准。",
                "它是以成品的出产日期作为基准，以生产周期和生产间隔期为参数，按产品工艺过程的相反顺序计算的。",
                "英文表达为：manufacturing lead time/throughput time。",
                "一个生产单元在流程中所花的总时间。",
                "物料清单管理系统将根据物料、工艺路线和资源可用性信息来计算制造提前期。"
            ],
            "solution": "【解析】以上关于制造提前期的描述都是正确的，它们都较为全面的解释了制造提前期。",
            "answers": [
                0,
                1,
                2,
                3,
                4
            ],
            "title": "以上关于制造提前期的描述都是正确的，它们都较为全面的解释了制造提前期。"
        }
        :return:
        """
        try:
            answers = self.answer.split(',')
            answers_list = []
            for c in answers:
                answers_list.append(self.AnswerDict[c])
            if answers_list == self.StringToDict()['answers']:
                return True
            else:
                return False
        except Exception as ex:
            return False

    def JudgmentFillIn(self):
        """
        判断填空题 stringresponse
        {
            "descriptions": {},
            "answers": [
                "广州",
                "北京",
                "深圳"
            ],
            "title": "中国最美的城市是__ "
        }
        :return:
        """
        try:
            if self.answer in self.StringToDict()['answers']:
                return True
            else:
                return False
        except Exception as ex:
            return False

    def StringToDict(self):
        """
        解析字符串
            -descriptions:{}
            -options:["87.5%","65%","35%","25%"],
            -solution:【解析】产出率=可用的65万部÷总数100万部。根据“该公司原计划投入800工时进行加工生产，实际上只用了700工时”得出的87.5%，是公司的实际产能利用率，不是产出率。
            -answers:1
            -title:产出率=可用的65万部÷总数100万部。根据“该公司原计划投入800工时进行加工生产，实际上只用了700工时”得出的87.5%，是公司的实际产能利用率，不是产出率。
        :return:
        """
        dictinfo = json.loads(self.context)
        return dictinfo
