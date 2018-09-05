# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from collections import OrderedDict

from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response

from exam_paper.utils import response_format


class FormatPageNumberPagination(PageNumberPagination):
    """
    A simple page number based style that supports page numbers as
    query parameters. For example:

    http://api.example.org/accounts/?page=4
    http://api.example.org/accounts/?page=4&page_size=100
    """
    page_size_query_param = 'page_size'
    page_size = 10
    max_page_size = 1000

    def get_paginated_response(self, data):
        return Response(response_format(OrderedDict([
            ('count', self.page.paginator.count),
            ('next', self.get_next_link()),
            ('previous', self.get_previous_link()),
            ('results', data)
        ])))
