# -*-coding:utf-8 -*-

from __future__ import unicode_literals

import random

from django.db import transaction
from rest_framework import filters
from rest_framework.authentication import BasicAuthentication
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
    - 试卷列表接口
        * 分页，单页 10 条记录
        * 排序，按创建时间、降序排序
        * 搜索，按「试卷名称」搜索
        * 权限
            - 老师看到自己的试卷
            - 企业管理员看到所有的试卷

    - 删除试卷接口
        * 权限，只能删除自己的试卷

    - 复制试卷接口
        * 「试卷名称」后面追加——(副本)
        * 权限，只能复制自己的试卷
    """
    authentication_classes = (
        BasicAuthentication,
    )
    permission_classes = (
        IsAuthenticated,
    )

    serializer_class = ExamPaperListSerializer
    filter_backends = (filters.SearchFilter, filters.OrderingFilter)
    search_fields = ('name', )
    ordering_fields = ('created', )
    ordering = ('created', )

    def get_queryset(self):
        user = self.request.user
        return ExamPaper.objects.filter(creator=user)

    def generate_random_problem(self, rules, section_problems):
        """
        rules = [{'id': 1, 'problem_type': 'sc', 'problem_num': 10}]
        section_problems = {
            '1': {
                'sc': [1, 2, 3, 4],
            },
            '2': {
                'sc': [1, 2, 3, 4],
            },
        }
        """
        all_problem = []
        for rule in rules:
            problem_data = section_problems[str(rule['id'])]
            problems = problem_data[rule['problem_type']]
            all_problem += random.sample(problems, rule['problem_num'])
        return all_problem

    def retrieve(self, request, *args, **kwargs):
        exam_paper = self.get_object()
        serializer = ExamPaperSerializer(exam_paper)

        if exam_paper.create_type == 'random':
            section_ids = exam_paper.rules.all().values_list(flat=True)

            # 题目数据
            section_problems = request.post('url', data={'section_ids': section_ids})

            rules = exam_paper.rules.all()
            all_problems = self.generate_random_problem(rules, section_problems)

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
    - 新增试卷接口
    ```
    {
      "problems": [
        {"grade": 5, "problem_id": 1, "sequence": 1},
        {"grade": 5, "problem_id": 2, "sequence": 2},
        {"grade": 5, "problem_id": 3, "sequence": 3}
      ],
      "name": "Middle Test",
      "description": "Everyone Calm Down"
    }
    ```

    - 试卷详情接口

    - 编辑试卷接口
        * 权限，只能编辑自己创建的试卷
    """
    authentication_classes = (
        BasicAuthentication,
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
    - 新增试卷接口（随机抽题）
    ```
    {
      "rules": [
        {"problem_section_id": 5, "problem_type": "sc", "problem_num": 1, "grade": 5},
        {"problem_section_id": 5, "problem_type": "mc", "problem_num": 1, "grade": 5},
        {"problem_section_id": 5, "problem_type": "fi", "problem_num": 1, "grade": 5},
        {"problem_section_id": 5, "problem_type": "tof", "problem_num": 1, "grade": 5}
      ],
      "name": "期中考试 random",
      "description": "大家冷静一下"
    }
    ```

    - 试卷详情接口

    - 编辑试卷接口
        * 权限，只能编辑自己创建的试卷

    """
    authentication_classes = (
        BasicAuthentication,
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



