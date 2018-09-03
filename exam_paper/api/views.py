# -*-coding:utf-8 -*-

from __future__ import unicode_literals

import random
from itertools import groupby

import requests
from django.conf import settings

from django.db import transaction
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
)
from exam_paper.models import ExamPaper
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
                    'sequence': openapi.Schema(type=openapi.TYPE_INTEGER, example=5),
                    'problem_id': openapi.Schema(type=openapi.TYPE_STRING, example='hello+hello+20180101+type@problem+block@915e0a76b7aa457f8cf616284bbfba32'),
                    'problem_type': openapi.Schema(type=openapi.TYPE_STRING, example='choiceresponse'),
                    'grade': openapi.Schema(type=openapi.TYPE_INTEGER, example=5),
                    'content': openapi.Schema(type=openapi.TYPE_OBJECT, properties={}),
                }
            )
        )
    },
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
    ordering = ('created',)

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

    @swagger_auto_schema(request_body=fix_exampaper)
    def create(self, request, *args, **kwargs):
        request.data['create_type'] = "fixed"
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
      "rules": [
        {
            "problem_section_id": "hogwarts+101+201801+type@sequential+block@0f6d6d4b762342218cc30cfe14b7e587",
            "problem_type": "choiceresponse",
            "problem_num": 1,
            "grade": 5
        },
        {
            "problem_section_id": "hogwarts+101+201801+type@sequential+block@0f6d6d4b762342218cc30cfe14b7e587",
            "problem_type": "multiplechoiceresponse",
            "problem_num": 1,
            "grade": 5
        }
      ],
      "name": "期中考试 random",
      "description": "大家冷静一下"
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
        request.data['create_type'] = "random"
        request.data['creator'] = request.user.id

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(response_format(serializer.data),
                        status=status.HTTP_201_CREATED,
                        headers=headers)

        response = super(ExamPaperRandomCreateViewSet, self).create(request, args, kwargs)
        return response

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        rules = serializer.data['rules']

        data = serializer.data
        data['rules'] = [(name, list(group)) for name, group in groupby(rules, lambda x: x['section_name'])]
        return Response(response_format(data))

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
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
        rep = requests.get(url, headers={'Authorization': 'Bearer ' + token})
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
        return Response(response_format(rep.json()))


class BlocksProblemsListAPIView(APIView):
    """
    获取课程的题目列表
    """
    authentication_classes = (SessionAuthentication, )
    permission_classes = (IsAuthenticated, )

    @swagger_auto_schema(
        operation_description='get courses problem list',
        manual_parameters=[page, page_size, search],
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
            # 'problem_type': request.query_params.get('problem_type', ''),
            'page': request.query_params.get('page'),
            'page_size': request.query_params.get('page_size'),
        }
        rep = requests.get(
            url,
            headers={'Authorization': 'Bearer ' + token},
            params=payload
        )
        return Response(response_format(rep.json()))


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
            }
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

    @swagger_auto_schema(operation_description='get section problem type count')
    def get(self, request, section_id, *args, **kwargs):
        token = request.user.social_auth.first().extra_data['access_token']
        url = settings.EDX_API['HOST'] + settings.EDX_API['SECTION_PROBLEM_TYPE_COUNT']
        rep = requests.get(
            url,
            headers={'Authorization': 'Bearer ' + token},
            param={'section_id': section_id}
        )
        return Response(response_format(rep.json()))

class GetUserInfo(APIView):
    """
    获取用户信息
    """
    authentication_classes = (SessionAuthentication, )
    permission_classes = (IsAuthenticated, )

    @swagger_auto_schema(operation_description='get user info')
    def get(self, request, *args, **kwargs):
        USER_INFO_API =  'api/mobile/v0.5/my_user_info'
        token = request.user.social_auth.first().extra_data['access_token']
        url = settings.EDX_LMS_PATH+USER_INFO_API
        rep = requests.get(
            url,
            headers={'Authorization': 'Bearer ' + token},
        )
        return Response(response_format(rep.json()))
