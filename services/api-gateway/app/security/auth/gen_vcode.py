#Function to generate a verification code for user registration
import random
import string

def gen_vcode(length=6):
    characters = string.ascii_uppercase + string.digits
    return ''.join(random.choice(characters) for _ in range(length))
