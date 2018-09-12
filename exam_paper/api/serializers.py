# -*- coding:utf-8 -*-

from __future__ import unicode_literals

from decimal import Decimal
from django.db import transaction
from rest_framework import serializers
from rest_framework.compat import MaxValueValidator, MinValueValidator
from rest_framework.exceptions import ValidationError

from exam_paper.models import ExamPaper, ExamPaperProblems, ExamPaperCreateRule


class ExamPaperMixin(object):

    def get_total_problem_num(self, exam_paper):
        return exam_paper.total_problem_num

    def get_total_grade(self, exam_paper):
        return exam_paper.total_grade

    def get_passing_grade(self, exam_paper):
        return exam_paper.total_grade * exam_paper.passing_ratio / Decimal(100.00)


class ExamPaperProblemsSerializer(serializers.ModelSerializer):
    content = serializers.JSONField(required=True)
    grade = serializers.DecimalField(max_digits=5, decimal_places=2,
                                     validators=[
                                         MinValueValidator(Decimal((0, (0, 0, 1), -2))),
                                         MaxValueValidator(Decimal(100))])

    class Meta:
        model = ExamPaperProblems
        fields = ('sequence', 'problem_id', 'grade', 'problem_type', 'content')


class ExamPaperCreateRuleSerializer(serializers.ModelSerializer):
    grade = serializers.DecimalField(max_digits=5, decimal_places=2, default=1.00,
                                     validators=[
                                         MinValueValidator(Decimal((0, (0, 0, 1), -2))),
                                         MaxValueValidator(Decimal(100))])

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
        fields = ('name', 'description', 'create_type', 'passing_grade',
                  'total_problem_num', 'total_grade', 'creator', 'problems')


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
    passing_ratio = serializers.IntegerField(default=60,
                                             validators=[
                                                 MinValueValidator(1),
                                                 MaxValueValidator(100)])

    class Meta:
        model = ExamPaper
        fields = ('name', 'description', 'create_type', 'creator',
                  'passing_ratio', 'problems', )

    def create(self, validated_data):
        problems_data = validated_data.pop('problems')
        if not problems_data:
            raise ValidationError('problems may not be blank.')
        exam_paper = ExamPaper.objects.create(**validated_data)
        with transaction.atomic():
            for problem_data in problems_data:
                problem_serializer = ExamPaperProblemsSerializer(data=problem_data)
                problem_serializer.is_valid(raise_exception=True)
                ExamPaperProblems.objects.create(exam_paper=exam_paper, **problem_serializer.validated_data)

        return exam_paper

    def update(self, exam_paper, validated_data):
        problems_data = validated_data.pop('problems')
        if not problems_data:
            raise ValidationError('problems may not be blank.')
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
    passing_ratio = serializers.IntegerField(default=60,
                                             validators=[
                                                 MinValueValidator(1),
                                                 MaxValueValidator(100)])
    description = serializers.CharField(required=False)

    class Meta:
        model = ExamPaper
        fields = ('name', 'description', 'create_type', 'creator',
                  'passing_ratio', 'rules')

    def create(self, validated_data):
        rules_data = validated_data.pop('rules')
        if not rules_data:
            raise ValidationError('rules may not be blank.')
        exam_paper = ExamPaper.objects.create(**validated_data)
        with transaction.atomic():
            for rule_data in rules_data:
                rule_serializer = ExamPaperCreateRuleSerializer(data=rule_data)
                rule_serializer.is_valid(raise_exception=True)
                ExamPaperCreateRule.objects.create(exam_paper=exam_paper, **rule_serializer.validated_data)

        return exam_paper

    def update(self, exam_paper, validated_data):
        rules_data = validated_data.pop('rules')
        if not rules_data:
            raise ValidationError('ruels may not be blank.')
        with transaction.atomic():
            exam_paper.__dict__.update(**validated_data)
            exam_paper.save()
            exam_paper.rules.all().delete()
            for rule_data in rules_data:
                if rule_data.get('id'):
                    rule_data.pop('id')

                rule_serializer = ExamPaperCreateRuleSerializer(data=rule_data)
                rule_serializer.is_valid(raise_exception=True)
                ExamPaperCreateRule.objects.create(exam_paper=exam_paper, **rule_serializer.validated_data)

        return exam_paper
