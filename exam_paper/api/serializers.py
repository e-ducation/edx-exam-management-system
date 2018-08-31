# -*- coding:utf-8 -*-

from __future__ import unicode_literals

from decimal import Decimal
from django.db import transaction
from rest_framework import serializers

from exam_paper.models import ExamPaper, ExamPaperProblems, ExamPaperCreateRule


class ExamPaperMixin(object):

    def get_total_problem_num(self, exam_paper):
        return exam_paper.total_problem_num

    def get_total_grade(self, exam_paper):
        return exam_paper.total_grade

    def get_passing_grade(self, exam_paper):
        return exam_paper.total_grade * exam_paper.passing_ratio / Decimal(100.00)


class ExamPaperProblemsSerializer(serializers.ModelSerializer):
    content = serializers.JSONField()

    class Meta:
        model = ExamPaperProblems
        fields = ('sequence', 'problem_id', 'grade', 'problem_type', 'content')


class ExamPaperCreateRuleSerializer(serializers.ModelSerializer):

    class Meta:
        model = ExamPaperCreateRule
        fields = ('section_name', 'problem_section_id', 'problem_type', 'problem_num', 'grade')


class ExamPaperSerializer(serializers.ModelSerializer, ExamPaperMixin):
    problems = ExamPaperProblemsSerializer(many=True)
    total_problem_num = serializers.SerializerMethodField()
    total_grade = serializers.SerializerMethodField()
    passing_grade = serializers.SerializerMethodField()

    class Meta:
        model = ExamPaper
        fields = ('name', 'description', 'total_problem_num', 'total_grade', 'passing_grade',
                  'creator', 'problems')


class ExamPaperListSerializer(serializers.ModelSerializer, ExamPaperMixin):

    creator = serializers.SlugRelatedField(read_only=True, slug_field='username')
    total_problem_num = serializers.SerializerMethodField()
    total_grade = serializers.SerializerMethodField()
    passing_grade = serializers.SerializerMethodField()

    class Meta:
        model = ExamPaper
        fields = ('id', 'name', 'create_type', 'total_problem_num',
                  'total_grade', 'passing_grade', 'creator')


class ExamPaperFixedSerializer(serializers.ModelSerializer):

    problems = ExamPaperProblemsSerializer(many=True)
    description = serializers.CharField(required=False)
    passing_ratio = serializers.IntegerField(default=60)

    class Meta:
        model = ExamPaper
        fields = ('name', 'description', 'create_type', 'creator',
                  'passing_ratio', 'problems', )

    def create(self, validated_data):
        problems_data = validated_data.pop('problems')
        exam_paper = ExamPaper.objects.create(**validated_data)
        with transaction.atomic():
            for problem_data in problems_data:
                problem_serializer = ExamPaperProblemsSerializer(data=problem_data)
                problem_serializer.is_valid(raise_exception=True)
                ExamPaperProblems.objects.create(exam_paper=exam_paper, **problem_serializer.validated_data)

        return exam_paper

    def update(self, exam_paper, validated_data):
        problems_data = validated_data.pop('problems')
        with transaction.atomic():
            exam_paper.__dict__.update(**validated_data)
            exam_paper.save()
            exam_paper.problems.all().delete()
            for problem_data in problems_data:
                if problem_data.get('id'):
                    problem_data.pop('id')
                problem_serializer = ExamPaperProblemsSerializer(data=problem_data)
                problem_serializer.is_valid(raise_exception=True)
                ExamPaperProblems.objects.create(exam_paper=exam_paper, **problem_serializer.validated_data)

        return exam_paper


class ExamPaperRandomSerializer(serializers.ModelSerializer):
    rules = ExamPaperCreateRuleSerializer(many=True)

    class Meta:
        model = ExamPaper
        fields = ('name', 'description', 'create_type', 'creator',
                  'passing_ratio', 'rules')

    def create(self, validated_data):
        rules_data = validated_data.pop('rules')
        exam_paper = ExamPaper.objects.create(**validated_data)
        with transaction.atomic():
            for rule_data in rules_data:
                rule_serializer = ExamPaperCreateRuleSerializer(data=rule_data)
                rule_serializer.is_valid(raise_exception=True)
                ExamPaperCreateRule.objects.create(exam_paper=exam_paper, **rule_serializer.validated_data)

        return exam_paper

    def update(self, exam_paper, validated_data):
        rules_data = validated_data.pop('rules')
        with transaction.atomic():
            exam_paper.__dict__.update(**validated_data)
            exam_paper.save()
            exam_paper.problems.all().delete()
            for rule_data in rules_data:
                if rule_data.get('id'):
                    rule_data.pop('id')

                rule_serializer = ExamPaperCreateRuleSerializer(data=rule_data)
                rule_serializer.is_valid(raise_exception=True)
                ExamPaperCreateRule.objects.create(exam_paper=exam_paper, **rule_serializer.validated_data)

        return exam_paper
