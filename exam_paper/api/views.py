# -*-coding:utf-8 -*-

from __future__ import unicode_literals

import random
import requests
from django.conf import settings

from django.db import transaction
from rest_framework import filters
from rest_framework.authentication import BasicAuthentication, SessionAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.viewsets import GenericViewSet
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

DUPLICATE_SUFFIX = '(copy)'


class ExamPaperListViewSet(RetrieveModelMixin, ListModelMixin, DestroyModelMixin, GenericViewSet):
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
        BasicAuthentication, SessionAuthentication
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
            section_ids = exam_paper.rules.all().values_list(flat=True)
            post_data = {
                'sections': list(section_ids),
                'types': ['multiplechoiceresponse', 'choiceresponse', 'stringresponse']
            }
            url = settings.EDX_API['HOST'] + settings.EDX_API['SECTION_PRBLEMS']
            rep = requests.post(url, json=post_data)

            all_problems = self.generate_random_problem(exam_paper.rules.all(), rep.json())

            serializer.data['problems'] = all_problems
            return Response(serializer.data)

        return Response(serializer.data)

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

        return Response('success')


class ExamPaperFixedCreateViewSet(CreateModelMixin, UpdateModelMixin,
                                  GenericViewSet):
    """
    create: 新增试卷接口（固定试题）
    **Example Requests**
    POST /api/exampaper/fixed/
    ```
    {
      "problems": [
        {"grade": 5, "problem_id": "hogwarts+101+201801+type@problem+block@9dd60b8e2d874ac19ccf4dc51315c8c5", "sequence": 1},
        {"grade": 5, "problem_id": "hogwarts+101+201801+type@problem+block@15328fcdccca433498ed0311603b60b3", "sequence": 2},
      ],
      "name": "Middle Test",
      "description": "Everyone Calm Down"
    }
    ```

    update: 编辑试卷接口（固定试题）
    - 权限，只能编辑自己创建的试卷

    partial_update: 编辑试卷接口（固定试题）
    - 权限，只能编辑自己创建的试卷

    """
    authentication_classes = (
        BasicAuthentication, SessionAuthentication
    )
    permission_classes = (
        IsAuthenticated,
    )
    serializer_class = ExamPaperFixedSerializer

    def get_queryset(self):
        user = self.request.user
        return ExamPaper.objects.filter(creator=user)

    def create(self, request, *args, **kwargs):
        request.data['create_type'] = "fixed"
        request.data['creator'] = request.user.id

        response = super(ExamPaperFixedCreateViewSet, self).create(request, args, kwargs)
        return response


class ExamPaperRandomCreateViewSet(CreateModelMixin, UpdateModelMixin, GenericViewSet):
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
        BasicAuthentication, SessionAuthentication
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

        response = super(ExamPaperRandomCreateViewSet, self).create(request, args, kwargs)
        return response
