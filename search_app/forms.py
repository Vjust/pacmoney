from django import forms
from django.core import validators
#from django.contrib.auth.models import User
#import re

from constants import MY_CHOICES
from constants import MY_CATEGORIES

class SearchForm(forms.Form):
    #example of Db lookup for a dropdown
    #category = forms.ModelChoiceField(Category.objects.all())
    donor = forms.CharField(label=u'Enter name of Contributor Org',
                           widget=forms.TextInput(attrs={'size': 10}),
                           error_messages={'required': 'Please enter name of organization'})
    #member = forms.ChoiceField (label=u'Select an Individual Member from the list', choices=MY_CHOICES, initial='1')
    #category =forms.ChoiceField (label=u'Select a Category below', choices=MY_CATEGORIES, initial='1')
