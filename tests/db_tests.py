from django.test import TestCase
from search_app.models import *


class DataTests(TestCase):
    """ Tests to verify basic DB entities"""
    
    def setUp(self):
        pass

    def test_candidate(self):
        """Candidate Steve Finch"""
        cand = Candidate.objects.get(pk=2253)
        self.assertIsNotNone(self, cand.cand_name)
        
