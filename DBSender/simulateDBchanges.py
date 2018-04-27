import requests
import json
import time
import random

def post(id, value):
	r = requests.post("http://localhost:8080/update", json={'_id': id, 'availability': value})
	print("Set " + id + " to " + str(value))
	return;

ids = ['4abfe91fd376605d02700b3b', '5abfe91fd376605d02700b3b']

while(True):
	post(ids[random.randint(0, 1)], random.randint(0, 40))
	time.sleep(random.uniform(2, 8))