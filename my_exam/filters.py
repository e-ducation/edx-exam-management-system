import re

from rest_framework.filters import OrderingFilter


class ExamParticipantOrdering(OrderingFilter):

    def filter_queryset(self, request, queryset, view):

        queryset = sorted(queryset, key=lambda x: (x.task_state == "finished",
                                                   x.task_state == "pending", x.task_state == "started"))
        return queryset
