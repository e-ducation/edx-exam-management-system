import re

from rest_framework.filters import OrderingFilter

from pypinyin import lazy_pinyin


class MyCustomOrdering(OrderingFilter):
    def new_re_search(self, str):
        # filtrate = re.compile(u'[^\u4E00-\u9FA5]')
        # rep = filtrate.sub(r'', str)
        rep = lazy_pinyin(str)
        return rep

    def filter_queryset(self, request, queryset, view):
        queryset = sorted(queryset, key=lambda x: (
            self.new_re_search(x.participant.username)))
        return queryset
