# -*- coding:utf-8 -*-
from __future__ import unicode_literals

from decimal import Decimal

from django.contrib.auth.models import User
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models
from django.db.models import Sum, F, Count

from model_utils.models import TimeStampedModel
from jsonfield import JSONField

PAPER_CREATE_TYPE = (
    ('fixed', 'fixed'),
    ('random', 'random')
)

PROBLEM_TYPE = (
    ('multiplechoiceresponse', 'single_choice'),
    ('choiceresponse', 'multi_choice'),
    ('stringresponse', 'fill_in'),
)

TASK_STATE = (
    ('pending', 'pending'),
    ('started', 'started'),
    ('finished', 'finished'),
    ('unavailable', 'unavailable'),
)

EXAM_RESULT = (
    ('pass', 'pass'),
    ('flunk', 'flunk'),
    ('pending', 'pending'),
)


class ExamPaper(TimeStampedModel):
    name = models.CharField(max_length=50, help_text='试卷名称')
    description = models.CharField(max_length=500, blank=True, help_text='试卷描述')
    create_type = models.CharField(max_length=16, choices=PAPER_CREATE_TYPE, default='fixed', help_text='试卷类型')
    passing_ratio = models.IntegerField(default=60,
                                        validators=[MinValueValidator(1), MaxValueValidator(100)],
                                        help_text='及格率')
    creator = models.ForeignKey(User, db_index=True, help_text='创建人')

    @property
    def total_problem_num(self):
        """
        试题数量
        """
        if self.create_type == PAPER_CREATE_TYPE[0][0]:
            return self.problems.count()
        elif self.create_type == PAPER_CREATE_TYPE[1][0]:
            result = self.rules.aggregate(total_problem_num=Sum('problem_num'))
            return result and result.get('total_problem_num') or 0
        else:
            return 0

    @property
    def total_grade(self):
        """
        试卷总分
        """
        if self.create_type == PAPER_CREATE_TYPE[0][0]:
            result = self.problems.aggregate(total_grade=Sum('grade'))
            return result and result.get('total_grade') or 0
        elif self.create_type == PAPER_CREATE_TYPE[1][0]:
            result = self.rules.aggregate(total_grade=Sum(F('grade') * F('problem_num')))
            return result and result.get('total_grade') or 0
        else:
            return 0

    @property
    def problem_statistic(self):
        if self.create_type == PAPER_CREATE_TYPE[0][0]:
            mutiple = self.problems.filter(problem_type=PROBLEM_TYPE[0][0]).aggregate(
                multiplechoiceresponse_count=Count('problem_type'),
                multiplechoiceresponse_grade=Sum('grade'),
            )
            choice = self.problems.filter(problem_type=PROBLEM_TYPE[1][0]).aggregate(
                choiceresponse_count=Count('pk'),
                choiceresponse_grade=Sum('grade'),
            )
            string = self.problems.filter(problem_type=PROBLEM_TYPE[2][0]).aggregate(
                stringresponse_count=Count('pk'),
                stringresponse_grade=Sum('grade'),
            )
            result = {}
            result.update(mutiple)
            result.update(choice)
            result.update(string)

            return result

        elif self.create_type == PAPER_CREATE_TYPE[1][0]:
            mutiple = self.rules.filter(problem_type=PROBLEM_TYPE[0][0]).aggregate(
                multiplechoiceresponse_count=Sum('problem_num'),
                multiplechoiceresponse_count2=Sum('problem_num'),
            )

            choice = self.rules.fileter(problem_type=PROBLEM_TYPE[1][0]).aggregate(
                choiceresponse_count=Sum('problem_num'),
                choiceresponse_grade=Sum(F('grade') * F('problem_num'), ),
            )

            string = self.rules.fileter(problem_type=PROBLEM_TYPE[2][0]).aggregate(
                stringresponse_count=Sum('problem_num', ),
                stringresponse_grade=Sum(F('grade') * F('problem_num'), ),
            )
            result = {}
            result.update(mutiple)
            result.update(choice)
            result.update(string)

            return result


class ExamPaperProblems(TimeStampedModel):
    exam_paper = models.ForeignKey(ExamPaper, related_name='problems', null=True, help_text='试卷')
    sequence = models.CharField(max_length=16, default='01', help_text='序号')
    problem_id = models.CharField(max_length=255, db_index=True, help_text='xblock id')
    problem_type = models.CharField(max_length=16, choices=PROBLEM_TYPE, help_text='问题类型')
    grade = models.DecimalField(max_digits=5, decimal_places=2, default=0,
                                validators=[
                                    MinValueValidator(Decimal((0, (0, 0, 1), -2))),
                                    MaxValueValidator(Decimal(100))],
                                help_text='分数')
    content = JSONField(help_text='问题内容')


class ExamPaperCreateRule(TimeStampedModel):
    exam_paper = models.ForeignKey(ExamPaper, related_name='rules', null=True, help_text='试卷')
    problem_section_id = models.CharField(max_length=255, null=True, blank=True, help_text='章节 xblock id')
    section_name = models.CharField(max_length=255, help_text='章节名称')
    problem_type = models.CharField(max_length=16, choices=PROBLEM_TYPE, help_text='问题类型')
    problem_num = models.IntegerField(default=0, help_text='抽题数量')
    grade = models.DecimalField(max_digits=5, decimal_places=2, default=1.00,
                                validators=[
                                    MinValueValidator(Decimal((0, (0, 0, 1), -2))),
                                    MaxValueValidator(Decimal(100))],
                                help_text='分数')


class ExamTask(TimeStampedModel):
    name = models.CharField(max_length=50, help_text='考试名称')
    exampaper = models.ForeignKey(ExamPaper, db_index=True, help_text='试卷')
    exampaper_name = models.CharField(max_length=50, help_text='试卷名称')
    exampaper_description = models.CharField(max_length=500, blank=True, help_text='试卷说明')
    exampaper_create_type = models.CharField(max_length=16, choices=PAPER_CREATE_TYPE, help_text='试卷类型')
    exampaper_passing_ratio = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(100)],
        help_text='及格率'
    )
    exampaper_total_problem_num = models.IntegerField(help_text='试题数量')
    exampaper_total_grade = models.DecimalField(
        max_digits=5, decimal_places=2, default=1.00,
        validators=[MinValueValidator(Decimal((0, (0, 0, 1), -2))), ], help_text='试卷总分')
    creator = models.ForeignKey(User, db_index=True, help_text='创建者')
    task_state = models.CharField(max_length=16, choices=TASK_STATE, default='pending', help_text='考试状态')
    period_start = models.DateTimeField(help_text='考试开始周期')
    period_end = models.DateTimeField(help_text='考试结束周期')
    exam_time_limit = models.IntegerField(
        validators=[MinValueValidator(10), MaxValueValidator(1440)],
        help_text='考试时间'
    )
    problem_disorder = models.BooleanField(default=False, help_text='题目乱序')
    show_answer = models.BooleanField(default=False, help_text='显示答案')

    @property
    def problem_statistic(self):
        if self.create_type == PAPER_CREATE_TYPE[0][0]:
            mutiple = self.problems.filter(problem_type=PROBLEM_TYPE[0][0]).aggregate(
                multiplechoiceresponse_count=Count('problem_type'),
                multiplechoiceresponse_grade=Sum('grade'),
            )
            choice = self.problems.filter(problem_type=PROBLEM_TYPE[1][0]).aggregate(
                choiceresponse_count=Count('pk'),
                choiceresponse_grade=Sum('grade'),
            )
            string = self.problems.filter(problem_type=PROBLEM_TYPE[2][0]).aggregate(
                stringresponse_count=Count('pk'),
                stringresponse_grade=Sum('grade'),
            )
            result = {}
            result.update(mutiple)
            result.update(choice)
            result.update(string)

            return result

        elif self.create_type == PAPER_CREATE_TYPE[1][0]:
            mutiple = self.rules.filter(problem_type=PROBLEM_TYPE[0][0]).aggregate(
                multiplechoiceresponse_count=Sum('problem_num'),
                multiplechoiceresponse_grade=Sum(F('grade') * F('problem_num'), ),
            )

            choice = self.rules.fileter(problem_type=PROBLEM_TYPE[1][0]).aggregate(
                choiceresponse_count=Sum('problem_num'),
                choiceresponse_grade=Sum(F('grade') * F('problem_num'), ),
            )

            string = self.rules.fileter(problem_type=PROBLEM_TYPE[2][0]).aggregate(
                stringresponse_count=Sum('problem_num', ),
                stringresponse_grade=Sum(F('grade') * F('problem_num'), ),
            )
            result = {}
            result.update(mutiple)
            result.update(choice)
            result.update(string)

            return result


class ExamParticipant(TimeStampedModel):
    exam_task = models.ForeignKey(ExamTask, related_name='participants', help_text='考试')
    participant = models.ForeignKey(User, related_name='exams', help_text='考生')
    exam_result = models.CharField(max_length=16, choices=EXAM_RESULT, help_text='考试结果', default='pending')
    task_state = models.CharField(max_length=16, choices=TASK_STATE, default='pending', help_text='考试状态')
    participate_time = models.DateTimeField(blank=True, null=True, help_text='应考时间')
    hand_in_time = models.DateTimeField(blank=True, null=True, help_text='交卷时间')

    @property
    def total_grade(self):
        """
        成绩
        """
        result = self.answers.aggregate(total_grade=Sum('grade'))
        return result and result.get('total_grade') or 0


class ExamPaperProblemsSnapShot(TimeStampedModel):
    exam_task = models.ForeignKey(ExamTask, related_name='problems', null=True, help_text='考试')
    sequence = models.CharField(max_length=16, default='01', help_text='序号')
    problem_block_id = models.CharField(max_length=255, db_index=True, help_text='xblock id')
    problem_type = models.CharField(max_length=16, choices=PROBLEM_TYPE, help_text='问题类型')
    grade = models.DecimalField(max_digits=5, decimal_places=2,
                                validators=[
                                    MinValueValidator(Decimal((0, (0, 0, 1), -2))),
                                    MaxValueValidator(Decimal(100))],
                                help_text='分数')
    content = JSONField(help_text='问题内容')


class ExamPaperCreateRuleSnapShot(TimeStampedModel):
    exam_task = models.ForeignKey(ExamTask, related_name='rules', null=True, help_text='考试')
    problem_section_id = models.CharField(max_length=255, null=True, blank=True, help_text='章节 xblock id')
    section_name = models.CharField(max_length=255, help_text='章节名称')
    problem_type = models.CharField(max_length=16, choices=PROBLEM_TYPE, help_text='问题类型')
    problem_num = models.IntegerField(default=0, help_text='抽题数量')
    grade = models.DecimalField(max_digits=5, decimal_places=2, default=1.00,
                                validators=[
                                    MinValueValidator(Decimal((0, (0, 0, 1), -2))),
                                    MaxValueValidator(Decimal(100))],
                                help_text='分数')


class ExamParticipantAnswer(TimeStampedModel):
    participant = models.ForeignKey(ExamParticipant, related_name='answers', help_text='考生')
    answer = models.TextField(help_text='考生答案', blank=True, null=True)
    grade = models.DecimalField(max_digits=5, decimal_places=2,
                                validators=[
                                    MinValueValidator(Decimal((0, (0, 0, 1), -2))),
                                    MaxValueValidator(Decimal(100))],
                                help_text='考生答案得分')
    sequence = models.CharField(max_length=16, default='01', help_text='序号')
    problem_type = models.CharField(max_length=16, choices=PROBLEM_TYPE, help_text='问题类型')
    content = JSONField(help_text='问题内容')
    operate_at = models.DateTimeField(help_text='操作时间', null=True)
