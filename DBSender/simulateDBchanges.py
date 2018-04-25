import requests
import json
import time
import random

def post(value):
	r = requests.post("http://localhost:8080/update", json={'_id': '4abfe91fd376605d02700b3b', 'availability': value})
	print("set to " + str(value))
	return;

while(True):
	post(random.randint(0, 40))
	time.sleep(random.uniform(1, 3))