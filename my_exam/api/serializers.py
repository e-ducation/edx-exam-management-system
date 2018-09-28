# -*- coding:utf-8 -*-

from __future__ import unicode_literals
import datetime
from decimal import Decimal
from django.db import transaction
import time
import pytz
from django.conf import settings
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

    def get_current_time(self, exam_participant):
        """
        返回服务器当前时间
        :param exam_participant:
        :return:
        """
        now_time = datetime.datetime.now().replace(tzinfo=pytz.utc).astimezone(
            pytz.timezone(settings.TIME_ZONE)).strftime('%Y-%m-%d %H:%M:%S')

        return now_time

    def get_total_grade(self, examparticipant):
        return examparticipant.total_grade


class ExamParticipantAnswerMixin(object):
    def get_answer(self, examparticipant_answer):
        """
        获得答案
        :param examparticipant_answer:
        :return:
        """
        if str(examparticipant_answer.answer):
            answers = str(examparticipant_answer.answer).split(',')
        else:
            answers = []
        data = []
        try:
            for answer in answers:
                data.append(int(answer))
        except Exception as ex:
            data = answers

        return data


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


class ExamPaperProblemsSnapShotSerializer(serializers.ModelSerializer):
    """
    考试任务试卷快照
    """
    class Meta:
        model = ExamPaperProblemsSnapShot
        fields = ('id', 'exam_task_id', 'sequence', 'problem_block_id', 'problem_type', 'grade', 'content')


class ExamParticipantAnswerSerializer(serializers.ModelSerializer, ExamParticipantAnswerMixin):
    """
    考生答卷
        exam_task_id
        participant_id
    """
    content = serializers.JSONField(required=True)
    # answer = serializers.SerializerMethodField()

    class Meta:
        model = ExamParticipantAnswer
        fields = ('id', 'participant_id', 'answer', 'grade', 'problem_grade', 'sequence', 'problem_type',
                  'content')
