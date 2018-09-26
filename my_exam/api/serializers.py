# -*- coding:utf-8 -*-

from __future__ import unicode_literals
import datetime
from decimal import Decimal
from django.db import transaction
from rest_framework import serializers
from rest_framework.compat import MaxValueValidator, MinValueValidator
from exam_paper.models import (
    ExamTask,
    ExamParticipant,
    ExamPaperProblemsSnapShot,
    ExamPaperCreateRuleSnapShot,
    ExamParticipantAnswer,
    PAPER_CREATE_TYPE
)


class ExamTaskMixin(object):

    def get_creator(self, exam_task):
        """
        返回发布考试任务的名称
        :param exam_task:
        :return:
        """
        try:
            creator_name = exam_task.creator.username
        except Exception as ex:
            creator_name = ''
        return creator_name


class ExamParticipantMixin(object):

    def get_total_grade(self, examparticipant):
        return examparticipant.total_grade


class ExamTaskSerializer(serializers.ModelSerializer, ExamTaskMixin):

    creator = serializers.SerializerMethodField()

    class Meta:
        model = ExamTask
        fields = ('id', 'name', 'exampaper_description', 'creator',
                  'period_start', 'period_end', 'exam_time_limit',
                  'exampaper_passing_ratio', 'exampaper_total_problem_num', 'exampaper_total_grade')


class MyExamListSerializer(serializers.ModelSerializer, ExamParticipantMixin):

    exam_task = ExamTaskSerializer()
    total_grade = serializers.SerializerMethodField()

    class Meta:
        model = ExamParticipant
        fields = (
            'id', 'exam_result', 'task_state', 'participate_time', 'hand_in_time', 'participant_id',
            'exam_task', 'total_grade')


class MyExamPaperSerializer(serializers.ModelSerializer):
    """

    """
    class Meta:
        model = ExamParticipant
        fields = (
            'id', 'exam_result', 'participate_time', 'hand_in_time', 'participant_id',
            'exam_task', 'current_time')


class ExamPaperProblemsSnapShotSerializer(serializers.ModelSerializer):
    """
    考试任务试卷快照
    """
    class Meta:
        model = ExamPaperProblemsSnapShot
        fields = ('id', 'exam_task_id', 'sequence', 'problem_block_id', 'problem_type', 'grade', 'content')


class ExamParticipantAnswerSerializer(serializers.ModelSerializer, ExamParticipantMixin):
    """
    考生答卷
        exam_task_id
        participant_id
    """
    current_time = serializers.SerializerMethodField()

    class Meta:
        model = ExamParticipantAnswer
        fields = ('id', 'participant_id', 'answer', 'grade', 'sequence', 'problem_type',
                  'content', 'operate_at', 'current_time')

    def create(self, validated_data):
        """
        创建考试答卷
        学生进入试卷的时候需要创建考试答卷
            -固定试卷
            -随机试卷
        :param validated_data:
        :return:
        """
        participant = validated_data['participant']
        exam_participant = ExamParticipant.objects.filter(id=participant).first()

        if not exam_participant:
            raise
        exam_task_id = exam_participant.exam_task_id

        try:
            exam_task = ExamTask.objects.get(id=exam_task_id)
        except Exception as ex:
            exam_task = None
        if exam_task.exampaper_create_type == PAPER_CREATE_TYPE[0][0]:
            # 固定考试生成试卷
            snapshot_list = ExamPaperProblemsSnapShot.objects.filter(exam_task_id=exam_task_id)
            for problem in snapshot_list:
                ExamParticipantAnswer.objects.create(
                    participant_id=participant,
                    answer='',
                    grade=problem.grade,
                    sequence=problem.sequence,
                    problem_type=PAPER_CREATE_TYPE[0][0],
                    content=problem.content,
                    operate_at=datetime.datetime.now()
                )
        else:
            # 随机考试生成试卷
            rule_snapshot_list = ExamPaperCreateRuleSnapShot.objects.filter(exam_task_id=exam_task_id)
            with transaction.atomic():
                for rule_data in rule_snapshot_list:
                    # 随机抽题规则
                    pass
        return exam_task

    def update(self, instance, validated_data):
        """
        更新
        :param instance:
        :param validated_data:
        :return:
        """
        instance.answer = validated_data.get('answer', instance.answer)
        instance.grade = validated_data.get('grade', instance.grade)
        instance.operate_at = validated_data.get('operate_at', instance.operate_at)
        instance.save()
        return instance
