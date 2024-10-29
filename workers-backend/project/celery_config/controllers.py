def sum_to_n(number):
    sum = 0
    for i in range(1, number + 1):
        sum += i
    return sum

def recommendation_extract_feature(json):
    return json
    # request_as_dict = json.loads(json)
    # for request, data in request_as_dict:
    #     yield request_id, (data['fixture'])

def get_score(atributos):
    1
    

def recommendation_return_best(json):
    best = []
    best_dict = dict()
    for request_name, atributes in recommendation_extract_feature(json):
        best_dict[request_name] = get_score(atributes)