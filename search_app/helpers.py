""" Utility functions
"""

import constants


def split_district_state(district_state):
    
    # format "TN-08"
    if '-' in district_state:
        state, district = district_state.split('-')    
    else:
        # format "TN08"
        state=district_state[0:2]
        district=district_state[2:4]
    
    return state, district