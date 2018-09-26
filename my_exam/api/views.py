# -*-coding:utf-8 -*-

from __future__ import unicode_literals
import datetime
import json

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
    ExamParticipantAnswerSerializer
)
from exam_paper.models import (
    ExamTask,
    ExamParticipant,
    ExamPaperProblemsSnapShot,
    ExamParticipantAnswer,
    PAPER_CREATE_TYPE
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


class MyExamViewSet(RetrieveModelMixin, ListModelMixin, GenericViewSet):
    """
    retrieve: 我的考试接口

    list: 我的考试列表接口
    * 分页，默认单页 10 条记录
    * 排序，默认按开考时间、降序排序， /api/my_exam/?ordering=created
    * 搜索，按「考试任务名称」搜索，/api/my_exam/?ordering=created&search=<exam task title>
    * 权限，只能看到自己的考试任务
    """
    # authentication_classes = (
    #     SessionAuthentication,
    # )
    # permission_classes = (
    #     IsAuthenticated,
    # )

    serializer_class = MyExamListSerializer
    filter_backends = (filters.SearchFilter, filters.OrderingFilter)
    search_fields = ('exam_task__name', 'exam_result')
    ordering_fields = ('exam_task__period_start',)
    ordering = ('-exam_task__period_start',)

    def get_queryset(self):
        user = self.request.user
        return ExamParticipant.objects.filter(participant=user)

    def retrieve(self, request, *args, **kwargs):
        my_exam = self.get_object()
        serializer = MyExamListSerializer(my_exam)

        res_data = serializer.data
        res_data["pending"] = 10
        return Response(response_format(res_data))

    @swagger_auto_schema(manual_parameters=[page, page_size])
    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())

        state_count = {
            'started': 0,
            'finished': 0,
            'unavailable': 0,
            'pending': 0
        }
        state_count.update(queryset.filter(exam_result='pending').aggregate(pending=Count('pk')))
        state_count.update(queryset.filter(exam_result='started').aggregate(started=Count('pk')))
        state_count.update(queryset.filter(exam_result='finished').aggregate(finished=Count('pk')))
        state_count.update(queryset.filter(exam_result='unavailable').aggregate(unavailable=Count('pk')))

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            assert self.paginator is not None
            return self.paginator.get_paginated_response(serializer.data, **state_count)

        serializer = self.get_serializer(queryset, many=True)

        return super(MyExamViewSet, self).list(request, args, kwargs)

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
                        return Response(serializer.data, status=status.HTTP_201_CREATED, headers={})
                    else:
                        ExamParticipantAnswer.objects.create(
                            participant=exam_participant,
                            sequence=problem.sequence,
                            problem_type=problem.problem_type,
                            content=problem.content,
                            answer='',
                            grade=0,
                            operate_at=datetime.datetime.now()
                        )
            serializer = ExamParticipantAnswerSerializer(ExamParticipantAnswer.objects.filter(participant_id=participant_id), many=True)

            return Response(serializer.data, status=status.HTTP_201_CREATED, headers={})
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


class ExamParticipantAnswerViewSet(CreateModelMixin, RetrieveModelMixin, ListModelMixin,
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
            return ExamParticipantAnswer.objects.all()

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

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
        'A': 1,
        'B': 2,
        'C': 3,
        'D': 4,
        'E': 5,
        'F': 6,
        'G': 7,
        'H': 8,
        'I': 9,
        'a': 1,
        'b': 2,
        'c': 3,
        'd': 4,
        'e': 5,
        'f': 6,
        'g': 7,
        'h': 8,
        'i': 9,

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
