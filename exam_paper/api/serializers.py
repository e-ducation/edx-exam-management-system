# -*- coding:utf-8 -*-

from __future__ import unicode_literals
from decimal import Decimal

from django.contrib.auth.models import User
from django.db import transaction

from django.contrib.auth import get_user_model

from rest_framework import serializers
from rest_framework.compat import MaxValueValidator, MinValueValidator

from exam_paper.models import (
    ExamPaper,
    ExamPaperProblems,
    ExamPaperCreateRule,
    ExamTask,
    ExamParticipant,
    ExamPaperProblemsSnapShot
)

from social_django.models import UserSocialAuth


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
                  'total_grade', 'passing_grade', 'creator',)


class ExamPaperFixedSerializer(serializers.ModelSerializer):
    problems = ExamPaperProblemsSerializer(many=True, required=False)
    description = serializers.CharField(required=False, allow_blank=True)
    passing_ratio = serializers.IntegerField(default=60,
                                             validators=[
                                                 MinValueValidator(1),
                                                 MaxValueValidator(100)])

    class Meta:
        model = ExamPaper
        fields = ('name', 'description', 'create_type', 'creator',
                  'passing_ratio', 'problems',)

    def create(self, validated_data):
        if 'problems' in validated_data:
            problems_data = validated_data.pop('problems')
        else:
            problems_data = []
        exam_paper = ExamPaper.objects.create(**validated_data)
        with transaction.atomic():
            for problem_data in problems_data:
                problem_serializer = ExamPaperProblemsSerializer(data=problem_data)
                problem_serializer.is_valid(raise_exception=True)
                ExamPaperProblems.objects.create(exam_paper=exam_paper, **problem_serializer.validated_data)

        return exam_paper

    def update(self, exam_paper, validated_data):
        if 'problems' in validated_data:
            problems_data = validated_data.pop('problems')
        else:
            problems_data = []
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
    rules = ExamPaperCreateRuleSerializer(many=True, required=False)
    passing_ratio = serializers.IntegerField(default=60,
                                             validators=[
                                                 MinValueValidator(1),
                                                 MaxValueValidator(100)])
    description = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = ExamPaper
        fields = ('name', 'description', 'create_type', 'creator',
                  'passing_ratio', 'rules')

    def create(self, validated_data):
        if 'rules' in validated_data:
            rules_data = validated_data.pop('rules')
        else:
            rules_data = []
        exam_paper = ExamPaper.objects.create(**validated_data)
        with transaction.atomic():
            for rule_data in rules_data:
                rule_serializer = ExamPaperCreateRuleSerializer(data=rule_data)
                rule_serializer.is_valid(raise_exception=True)
                ExamPaperCreateRule.objects.create(exam_paper=exam_paper, **rule_serializer.validated_data)

        return exam_paper

    def update(self, exam_paper, validated_data):
        if 'rules' in validated_data:
            rules_data = validated_data.pop('rules')
        else:
            rules_data = []
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


class UserSerializer(serializers.ModelSerializer):
    username = serializers.CharField(required=True)
    email = serializers.EmailField(required=True)

    class Meta:
        model = get_user_model()
        fields = ('id', 'username', 'email')


class ExamParticipantSerializer2(serializers.ModelSerializer):
    participant = UserSerializer(read_only=True)
    num_of_people = serializers.SerializerMethodField()

    def get_num_of_people(self, obj):
        num_of_people = {}
        num_of_people['pending'] = ExamParticipant.objects.filter(exam_result='pending').count()
        num_of_people['flunk'] = ExamParticipant.objects.filter(exam_result='flunk').count()
        num_of_people['pass'] = ExamParticipant.objects.filter(exam_result='pass').count()
        return num_of_people

    class Meta:
        model = ExamParticipant
        fields = ('exam_task', 'participant', 'exam_result', 'participate_time',
                  'hand_in_time', 'total_grade', 'num_of_people')


class ExamParticipantSerializer(serializers.ModelSerializer):
    exam_result = serializers.CharField(required=False)
    participate_time = serializers.DateTimeField(required=False)
    hand_in_time = serializers.DateTimeField(required=False)
    participant = UserSerializer()

    class Meta:
        model = ExamParticipant
        fields = ('participant', 'exam_result', 'participate_time', 'hand_in_time')


class ExamTaskSerializer(serializers.ModelSerializer):
    participant_num = serializers.SerializerMethodField()
    creator = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), write_only=True)
    exampaper = serializers.PrimaryKeyRelatedField(queryset=ExamPaper.objects.all())
    task_state = serializers.CharField(read_only=True)
    participants = ExamParticipantSerializer(many=True, required=False)
    problem_disorder = serializers.BooleanField(required=False)
    show_answer = serializers.BooleanField(required=False)

    class Meta:
        model = ExamTask
        fields = ('id', 'name', 'exampaper', 'exampaper_name', 'exampaper_description',
                  'exampaper_create_type', 'exampaper_passing_ratio', 'exampaper_total_problem_num',
                  'exampaper_total_grade', 'creator',
                  'task_state', 'period_start', 'period_end', 'exam_time_limit',
                  'problem_disorder', 'show_answer', 'participants', 'participant_num')

    def get_participant_num(self, exam_task):
        """
        考试人数
        """
        return exam_task.participants.count()

    def create(self, validated_data):
        if 'participants' in validated_data:
            participants = validated_data.pop('participants')
        else:
            participants = []

        with transaction.atomic():
            exam_task = ExamTask.objects.create(**validated_data)
            for participant in participants:
                # 查询用户是否存在，不存在则创建用户
                user = Find_or_create_user(participant)
                ExamParticipant.objects.create(exam_task=exam_task, participant=user)

            exam_paper = validated_data['exampaper']
            if exam_paper.create_type == 'fixed':
                for problem in exam_paper.problems.all():
                    ExamPaperProblemsSnapShot.objects.create(
                        exam_task=exam_task,
                        sequence=problem.sequence,
                        problem_block_id=problem.problem_id,
                        problem_type=problem.problem_type,
                        grade=problem.grade,
                        content=problem.content
                    )

        return exam_task

    def update(self, exam_task, validated_data):
        if 'participants' in validated_data:
            participants = validated_data.pop('participants')
        else:
            participants = []

        with transaction.atomic():
            exam_task.__dict__.update(**validated_data)
            exam_task.save()
            exam_task.participants.all().delete()
            for participant in participants:
                # 查询用户是否存在，不存在则创建用户
                user = Find_or_create_user(participant)
                ExamParticipant.objects.create(exam_task=exam_task, participant=user)

            exam_paper = validated_data['exampaper']
            if exam_paper.create_type == 'fixed':
                exam_task.problems.all().delete()
                for problem in exam_paper.problems.all():
                    ExamPaperProblemsSnapShot.objects.create(
                        exam_task=exam_task,
                        sequence=problem.sequence,
                        problem_block_id=problem.problem_id,
                        problem_type=problem.problem_type,
                        grade=problem.grade,
                        content=problem.content
                    )

        return exam_task


def Find_or_create_user(participant):
    user = UserSocialAuth.objects.filter(uid=participant['participant']['username'])
    if user:
        return user[0].user
    else:
        user_model = get_user_model()
        new_user = user_model.objects.create(password=user_model.objects.make_random_password(),
                                             **participant['participant'])
        UserSocialAuth.objects.create(user=new_user, provider='edx-oidc', uid=participant['participant']['username'])
        return new_user
