# -*-coding:utf-8 -*-
from __future__ import unicode_literals

import random
import requests
from itertools import groupby

from django.conf import settings
from django.db import transaction
from django.db.models import Count, Q
from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend

from drf_yasg import openapi
from drf_yasg.utils import swagger_auto_schema
from rest_framework import filters, status
from rest_framework.authentication import SessionAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.serializers import Serializer
from rest_framework.viewsets import GenericViewSet
from rest_framework.views import APIView
from rest_framework.mixins import (
    CreateModelMixin,
    ListModelMixin,
    DestroyModelMixin,
    RetrieveModelMixin,
    UpdateModelMixin
)

from exam_paper.api.serializers import (
    ExamPaperSerializer,
    ExamPaperListSerializer,
    ExamPaperFixedSerializer,
    ExamPaperRandomSerializer,
    ExamTaskSerializer)
from exam_paper.models import ExamPaper, PAPER_CREATE_TYPE, ExamTask, TASK_STATE
from exam_paper.pageinations import FormatPageNumberPagination
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


class ExamPaperListViewSet(RetrieveModelMixin, ListModelMixin,
                           DestroyModelMixin, GenericViewSet):
    """
    retrieve: 试卷详情接口

    list: 试卷列表接口
    * 分页，默认单页 10 条记录
    * 排序，默认按创建时间、降序排序， /api/exampaper?ordering=created
    * 搜索，按「试卷名称」搜索，/api/exampaper?ordering=created?search=<exam paper title>
    * 权限，只能看到自己的试卷

    destroy: 删除试卷接口
    * 权限，只能删除自己的试卷

    duplicate: 复制试卷接口
    - 「试卷名称」后面追加「(副本)」
    - 权限，只能复制自己的试卷

    """
    authentication_classes = (
        SessionAuthentication,
    )
    permission_classes = (
        IsAuthenticated,
    )

    serializer_class = ExamPaperListSerializer
    filter_backends = (filters.SearchFilter, filters.OrderingFilter)
    search_fields = ('name',)
    ordering_fields = ('created',)
    ordering = ('-created',)

    def get_queryset(self):
        user = self.request.user
        return ExamPaper.objects.filter(creator=user)

    def generate_random_problem(self, rules, section_problems):
        """
        use generated rule to get random problems from section problems
        """
        all_problem = []
        for rule in rules:
            problem_data = section_problems[rule.problem_section_id]
            problems = problem_data[rule.problem_type]
            all_problem += random.sample(problems, rule.problem_num)
        return all_problem

    def retrieve(self, request, *args, **kwargs):
        exam_paper = self.get_object()
        serializer = ExamPaperSerializer(exam_paper)

        if exam_paper.create_type == 'random':
            section_ids = exam_paper.rules.values_list('problem_section_id', flat=True)
            post_data = {
                'sections': list(section_ids),
                'types': ['multiplechoiceresponse', 'choiceresponse', 'stringresponse']
            }

            token = request.user.social_auth.first().extra_data[u'access_token']
            url = settings.EDX_API['HOST'] + settings.EDX_API['SECTION_PROBLEMS']
            rep = requests.post(url, json=post_data, headers={'Authorization': 'Bearer ' + token})

            all_problems = self.generate_random_problem(exam_paper.rules.all(), rep.json())

            res_data = serializer.data
            res_data['problems'] = all_problems

            return Response(response_format(res_data))

        return Response(response_format(serializer.data))

    @swagger_auto_schema(manual_parameters=[page, page_size])
    def list(self, request, *args, **kwargs):
        return super(ExamPaperListViewSet, self).list(request, args, kwargs)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response(response_format())

    @swagger_auto_schema(request_body=Serializer)
    @action(methods=['POST'], detail=True)
    def duplicate(self, request, pk, *args, **kwargs):
        exam_paper = self.get_object()
        name = exam_paper.name
        problems = exam_paper.problems.all()
        rules = exam_paper.rules.all()

        exam_paper.pk = None
        exam_paper.name = name + DUPLICATE_SUFFIX
        exam_paper.created = timezone.now()
        exam_paper.modified = timezone.now()
        exam_paper.creator = self.request.user

        exam_paper.save()

        with transaction.atomic():
            for problem in problems:
                problem.pk = None
                problem.exam_paper = exam_paper
                problem.save()

            for rule in rules:
                rule.pk = None
                rule.exam_paper = exam_paper
                rule.save()

        return Response(response_format())


class ExamPaperFixedCreateViewSet(RetrieveModelMixin, CreateModelMixin, UpdateModelMixin,
                                  GenericViewSet):
    """
    create: 新增试卷接口（固定试题）

    update: 编辑试卷接口（固定试题）
    - 权限，只能编辑自己创建的试卷

    partial_update: 编辑试卷接口（固定试题）
    - 权限，只能编辑自己创建的试卷

    ```
    {
      "name": "Middle Exam",
      "description": "Middle Exam",
      "passing_ratio": 60,
      "problems": [
        {
          "sequence": 5,
          "problem_id": "hello+hello+20180101+type@problem+block@915e0a76b7aa457f8cf616284bbfba32",
          "grade": "5.00"
        }
      ]
    }
    ```
    """
    authentication_classes = (
        SessionAuthentication,
    )
    permission_classes = (
        IsAuthenticated,
    )
    serializer_class = ExamPaperFixedSerializer

    def get_queryset(self):
        user = self.request.user
        return ExamPaper.objects.filter(creator=user)

    @swagger_auto_schema(
        request_body=fix_exampaper,
    )
    def create(self, request, *args, **kwargs):
        request.data['create_type'] = PAPER_CREATE_TYPE[0][0]
        request.data['creator'] = request.user.id

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(response_format(serializer.data), status=status.HTTP_201_CREATED, headers=headers)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response(response_format(serializer.data))

    @swagger_auto_schema(request_body=fix_exampaper)
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)

        request.data['create_type'] = PAPER_CREATE_TYPE[0][0]
        request.data['creator'] = request.user.id

        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        if getattr(instance, '_prefetched_objects_cache', None):
            # If 'prefetch_related' has been applied to a queryset, we need to
            # forcibly invalidate the prefetch cache on the instance.
            instance._prefetched_objects_cache = {}

        return Response(response_format(serializer.data))

    @swagger_auto_schema(request_body=fix_exampaper)
    def partial_update(self, request, *args, **kwargs):
        return super(ExamPaperFixedCreateViewSet, self).partial_update(request, args, kwargs)


class ExamPaperRandomCreateViewSet(RetrieveModelMixin, CreateModelMixin, UpdateModelMixin,
                                   GenericViewSet):
    """
    create: 新增试卷接口（随机抽题）

    **Example Requests**
    POST /api/exampaper/random/
    ```
    {
        "name": "期中考试 random",
        "description": "大家冷静一下",
        "passing_ratio": 60,
        "subject": [{
            "id": "hello+hello+20180101+type@sequential+block@c3056700551049eb9767b71a8072f295",
            "name": "1.1 大数据与数据科学",
            "choiceresponse": 1,
            "choiceresponseGrade": 1,
            "choiceresponseNumber": 0,
            "multiplechoiceresponse": 5,
            "multiplechoiceresponseGrade": 1,
            "multiplechoiceresponseNumber": 0,
            "stringresponse": 1,
            "stringresponseGrade": 1,
            "stringresponseNumber": 0
        }]
    }
    ```

    update: 编辑试卷接口（随机抽题）
    - 权限，只能编辑自己创建的试卷

    partial_update: 编辑试卷接口（随机抽题）
    - 权限，只能编辑自己创建的试卷
    """
    authentication_classes = (
        SessionAuthentication,
    )
    permission_classes = (
        IsAuthenticated,
    )
    serializer_class = ExamPaperRandomSerializer

    def get_queryset(self):
        user = self.request.user
        return ExamPaper.objects.filter(creator=user)

    def create(self, request, *args, **kwargs):
        request.data['create_type'] = PAPER_CREATE_TYPE[1][0]
        request.data['creator'] = request.user.id

        rules = request.data['subject']
        new_rules = []
        for rule in rules:
            new_rules += [
                {
                    'problem_section_id': rule['id'],
                    'section_name': rule['name'],
                    'problem_type': 'choiceresponse',
                    'problem_num': rule['choiceresponseNumber'],
                    'grade': rule['choiceresponseGrade']
                },
                {
                    'problem_section_id': rule['id'],
                    'section_name': rule['name'],
                    'problem_type': 'multiplechoiceresponse',
                    'problem_num': rule['multiplechoiceresponseNumber'],
                    'grade': rule['multiplechoiceresponseGrade']
                },
                {
                    'problem_section_id': rule['id'],
                    'section_name': rule['name'],
                    'problem_type': 'stringresponse',
                    'problem_num': rule['stringresponseNumber'],
                    'grade': rule['stringresponseGrade']
                },
            ]
        request.data['rules'] = new_rules

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(response_format(serializer.data),
                        status=status.HTTP_201_CREATED,
                        headers=headers)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        rules = serializer.data['rules']

        data = serializer.data

        subject = []
        for name, group in groupby(rules, lambda x: x['section_name']):
            section_rule = {
                'name': name,
            }
            for rule in group:
                section_rule['id'] = rule['problem_section_id']
                section_rule[rule['problem_type'] + 'Grade'] = rule['grade']
                section_rule[rule['problem_type'] + 'Number'] = rule['problem_num']
            subject.append(section_rule)
        data['subject'] = subject

        return Response(response_format(data))

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)

        request.data['create_type'] = PAPER_CREATE_TYPE[1][0]
        request.data['creator'] = request.user.id

        rules = request.data['subject']
        new_rules = []
        for rule in rules:
            new_rules += [
                {
                    'problem_section_id': rule['id'],
                    'section_name': rule['name'],
                    'problem_type': 'choiceresponse',
                    'problem_num': rule['choiceresponseNumber'],
                    'grade': rule['choiceresponseGrade']
                },
                {
                    'problem_section_id': rule['id'],
                    'section_name': rule['name'],
                    'problem_type': 'multiplechoiceresponse',
                    'problem_num': rule['multiplechoiceresponseNumber'],
                    'grade': rule['multiplechoiceresponseGrade']
                },
                {
                    'problem_section_id': rule['id'],
                    'section_name': rule['name'],
                    'problem_type': 'stringresponse',
                    'problem_num': rule['stringresponseNumber'],
                    'grade': rule['stringresponseGrade']
                },
            ]
        request.data['rules'] = new_rules

        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        if getattr(instance, '_prefetched_objects_cache', None):
            # If 'prefetch_related' has been applied to a queryset, we need to
            # forcibly invalidate the prefetch cache on the instance.
            instance._prefetched_objects_cache = {}

        return Response(response_format(serializer.data))


class CoursesListAPIView(APIView):
    authentication_classes = (SessionAuthentication, )
    permission_classes = (IsAuthenticated, )

    @swagger_auto_schema(
        operation_description='get courses list',
        manual_parameters=[search],
        responses={
            200: openapi.Schema(
                title='response',
                type=openapi.TYPE_ARRAY,
                items=openapi.Schema(
                    type=openapi.TYPE_OBJECT,
                    properties={
                        'id': openapi.Schema(
                            type=openapi.TYPE_STRING,
                            example='course-v1:edX+E2E-101+course'),
                        'display_name': openapi.Schema(
                            type=openapi.TYPE_STRING,
                            example='E2E Test Course'),
                    }
                )
            ),
        }
    )
    def get(self, request, *args, **kwargs):
        token = request.user.social_auth.first().extra_data['access_token']
        url = settings.EDX_API['HOST'] + settings.EDX_API['COURSES']
        rep = requests.get(
            url,
            headers={'Authorization': 'Bearer ' + token},
            params={
                'title': request.query_params.get('search')
            }
        )
        return Response(response_format(rep.json()))


class CourseSectionsListAPIView(APIView):
    """
    获取课程的章节列表
    """
    authentication_classes = (SessionAuthentication, )
    permission_classes = (IsAuthenticated, )

    @swagger_auto_schema(
        operation_description='get course sections list',
        responses={
            200: openapi.Schema(
                title='response',
                type=openapi.TYPE_ARRAY,
                items=openapi.Schema(
                    type=openapi.TYPE_OBJECT,
                    properties={
                        'id': openapi.Schema(
                            type=openapi.TYPE_STRING,
                            example='hello+hello+20180101+type@chapter+block@9a1eca362d3443ef8e0332f0cb857e7c'),
                        'name': openapi.Schema(
                            type=openapi.TYPE_STRING,
                            example='CH01 引言'),
                    }
                )
            ),
        }
    )
    def get(self, request, course_id, *args, **kwargs):
        token = request.user.social_auth.first().extra_data['access_token']
        url = settings.EDX_API['HOST'] + settings.EDX_API['COURSE_SECTIONS']
        payload = {
            'course_id': course_id
        }
        rep = requests.get(
            url,
            headers={'Authorization': 'Bearer ' + token},
            params=payload
        )
        if rep.status_code == 400:
            return Response(response_format(status=rep.json().get('code'),
                                            msg=rep.json().get('msg')))
        else:
            return Response(response_format(rep.json()))


class BlocksProblemsListAPIView(APIView):
    """
    获取课程的题目列表
    """
    authentication_classes = (SessionAuthentication, )
    permission_classes = (IsAuthenticated, )

    @swagger_auto_schema(
        operation_description='get courses problem list',
        manual_parameters=[page, page_size, search, problem_type],
        responses={
            200: openapi.Schema(
                title='response',
                type=openapi.TYPE_OBJECT,
                properties={
                    'count': openapi.Schema(type=openapi.TYPE_INTEGER),
                    'next': openapi.Schema(type=openapi.TYPE_STRING),
                    'previous': openapi.Schema(type=openapi.TYPE_STRING),
                    'results': openapi.Schema(
                        type=openapi.TYPE_ARRAY,
                        items=openapi.Schema(
                            type=openapi.TYPE_OBJECT,
                            properties={
                                'id': openapi.Schema(
                                    type=openapi.TYPE_STRING,
                                    example='Valhalla+CS101+20180830+type@problem+block@e4a7309d41584357b2269a56fbb23cef'),
                                'name': openapi.Schema(
                                    type=openapi.TYPE_STRING,
                                    example='Checkboxes'),
                                'type': openapi.Schema(
                                    type=openapi.TYPE_STRING,
                                    example='choiceresponse'),
                                'markdown': openapi.Schema(
                                    type=openapi.TYPE_STRING,
                                    example='E2E Test Course'),
                            }
                        )
                    ),
                }
            ),
        }
    )
    def get(self, request, block_id, *args, **kwargs):

        token = request.user.social_auth.first().extra_data['access_token']
        url = settings.EDX_API['HOST'] + settings.EDX_API['COURSE_PROBLEMS']
        payload = {
            'block_id': block_id,
            'text': request.query_params.get('search', ''),
            'problem_type': request.query_params.get('problem_type', None),
            'page': request.query_params.get('page'),
            'page_size': request.query_params.get('page_size'),
        }
        rep = requests.get(
            url,
            headers={'Authorization': 'Bearer ' + token},
            params=payload
        )
        if rep.status_code == 400:
            return Response(response_format(status=rep.json().get('code'),
                                            msg=rep.json().get('msg')))
        elif rep.status_code == 200:
            return Response(response_format(rep.json()))
        else:
            return Response(rep.text)


class ProblemsDetailAPIView(APIView):
    """
    获取题目内容
    """
    authentication_classes = (SessionAuthentication, )
    permission_classes = (IsAuthenticated, )

    @swagger_auto_schema(
        operation_id='problem_content',
        operation_description='get problem content',
        request_body=openapi.Schema(
            title='body',
            type=openapi.TYPE_OBJECT,
            properties={
                'problems': openapi.Schema(
                    type=openapi.TYPE_ARRAY,
                    items=openapi.Schema(
                        type=openapi.TYPE_STRING,
                        example='hello+hello+20180101+type@problem+block@915e0a76b7aa457f8cf616284bbfba32'
                    )
                )
            },
            required=['problems']
        ),
        responses={
            200: openapi.Schema(
                title='response',
                type=openapi.TYPE_ARRAY,
                items=openapi.Schema(type=openapi.TYPE_STRING)
            ),
        }
    )
    def post(self, request, *args, **kwargs):
        token = request.user.social_auth.first().extra_data['access_token']
        url = settings.EDX_API['HOST'] + settings.EDX_API['PROBLEM_DETAIL']
        post_data = {
            'problems': request.data.get('problems')
        }
        rep = requests.post(
            url,
            headers={'Authorization': 'Bearer ' + token},
            json=post_data
        )
        if rep.status_code == 400:
            return Response(response_format(status=rep.json().get('code'),
                                            msg=rep.json().get('msg')))
        else:
            return Response(response_format(rep.json()))


class ProblemsTypesAPIView(APIView):
    """
    获取题目类型
    """
    authentication_classes = (SessionAuthentication, )
    permission_classes = (IsAuthenticated, )

    @swagger_auto_schema(
        operation_description='get problem type',
        responses={
            200: openapi.Schema(
                title='response',
                type=openapi.TYPE_ARRAY,
                items=openapi.Schema(
                    type=openapi.TYPE_STRING,
                )
            ),
        }
    )
    def get(self, request, *args, **kwargs):
        token = request.user.social_auth.first().extra_data['access_token']
        url = settings.EDX_API['HOST'] + settings.EDX_API['PROBLEM_TYPES']
        rep = requests.get(url, headers={'Authorization': 'Bearer ' + token})
        return Response(response_format(rep.json()))


class SectionProblemTypeCountView(APIView):
    """
    获取章节的题型统计数据
    """
    authentication_classes = (SessionAuthentication, )
    permission_classes = (IsAuthenticated, )

    @swagger_auto_schema(
        operation_description='get section problem type count',
        request_body=openapi.Schema(
            title='body',
            type=openapi.TYPE_OBJECT,
            properties={
                'section_ids': openapi.Schema(
                    type=openapi.TYPE_ARRAY,
                    items=openapi.Schema(
                        type=openapi.TYPE_STRING,
                        example=''
                    ),
                )
            },
            required=['section_ids']
        ),
    )
    def post(self, request, *args, **kwargs):
        token = request.user.social_auth.first().extra_data['access_token']

        section_ids = request.data.get('section_ids')

        url = settings.EDX_API['HOST'] + settings.EDX_API['SECTION_PROBLEM_TYPE_COUNT']
        rep = requests.post(
            url,
            headers={'Authorization': 'Bearer ' + token},
            json={'section_id': section_ids}
        )
        return Response(response_format(rep.json()))


class UserInfoView(APIView):
    """
    获取用户信息
    """
    authentication_classes = (SessionAuthentication, )
    permission_classes = (IsAuthenticated, )

    @swagger_auto_schema(operation_description='get user info')
    def get(self, request, *args, **kwargs):
        USER_INFO_API = 'api/mobile/v0.5/my_user_info'
        token = request.user.social_auth.first().extra_data['access_token']
        url = settings.EDX_LMS_PATH + USER_INFO_API
        rep = requests.get(
            url,
            headers={'Authorization': 'Bearer ' + token},
        )
        return Response(response_format(rep.json()))


class ExamTaskViewSet(CreateModelMixin, RetrieveModelMixin, ListModelMixin,
                      UpdateModelMixin, DestroyModelMixin, GenericViewSet):
    """
    ```
    {
      "name": "考试任务",
      "exampaper": 13,
      "exampaper_name": "test",
      "exampaper_description": "test",
      "exampaper_create_type": "fixed",
      "exampaper_passing_ratio": 60,
      "period_start": "2018-09-19T08:02:25.955Z",
      "period_end": "2018-09-19T08:02:25.955Z",
      "exam_time_limit": 60,
      "participants": [
        {
          "participant": 1
        }
      ]
    }
    ```
    """

    authentication_classes = (
        SessionAuthentication,
    )
    permission_classes = (
        IsAuthenticated,
    )
    serializer_class = ExamTaskSerializer
    filter_backends = (filters.SearchFilter, filters.OrderingFilter,
                       DjangoFilterBackend,)
    filter_fields = ('task_state', )
    search_fields = ('name', )
    ordering_fields = ('modified',)
    ordering = ('-modified',)

    def get_queryset(self):
        user = self.request.user
        return ExamTask.objects.filter(creator=user)

    def create(self, request, *args, **kwargs):
        request.data['creator'] = request.user.id

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())

        state_count = queryset.aggregate(
            pending=Count('pk', filter=Q(task_state='pending')),
            started=Count('pk', filter=Q(task_state='started')),
            finished=Count('pk', filter=Q(task_state='finished')),
            unavailable=Count('pk', filter=Q(task_state='unavailable')),
        )

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            assert self.paginator is not None
            return self.paginator.get_paginated_response(serializer.data, **state_count)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    def update(self, request, *args, **kwargs):
        """
        「考试中」和「考试结束」不可编辑
        """
        instance = self.get_object()
        if instance.task_state in (TASK_STATE[1][0], TASK_STATE[2][0]):
            return Response(response_format(msg='Can not edit started task'))
        return super(ExamTaskViewSet, self).update(request, args, kwargs)

    def partial_update(self, request, *args, **kwargs):
        """
        「考试中」和「考试结束」不可编辑
        """
        instance = self.get_object()
        if instance.task_state in (TASK_STATE[1][0], TASK_STATE[2][0]):
            return Response(response_format(msg='Can not edit started task'))
        return super(ExamTaskViewSet, self).partial_update(request, args, kwargs)

    def destroy(self, request, *args, **kwargs):
        """
        「考试中」的任务不能删除操作；
        """
        instance = self.get_object()
        if instance.task_state == TASK_STATE[1][0]:
            return Response(response_format(msg='Can not delete started task'))
        return super(ExamTaskViewSet, self).destroy(request, args, kwargs)
