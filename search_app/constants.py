__author__ = 'vjust'

MY_CHOICES = (
    ('1', 'Barack Obama'),
    ('2', 'John Boehner'),
    ('3', 'Test'),
    )

MY_CATEGORIES = (
    ('1', 'Contributor'),
    ('2', 'Amount'),
    ('3', 'Contributor Industry'),
    )

DIST_LABEL='district'
STATE_LABEL='state'

def get_choice(key_value):
    for i in MY_CHOICES:
        if i[0] == key_value:
            return i[1]
    return None

def get_category(key_value):
    for i in MY_CATEGORIES:
        if i[0] == key_value:
            return i[1]
    return None