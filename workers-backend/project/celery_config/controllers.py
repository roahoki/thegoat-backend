def sum_to_n(number):
    sum = 0
    for i in range(1, number + 1):
        sum += i
    return sum


def get_odd_value(fixture_id, team, old_fixtures):
    try:
        for fixture in old_fixtures:
            if fixture['id'] == fixture_id:

                if (fixture['homeTeam']['name'] == team) or (team == 'Team A'):
                    odds_value_key = 'Home'

                elif fixture['awayTeam']['name'] == team:
                    odds_value_key = 'Away'
                
                for odd in fixture['odds']:
                    if odd.get('value') == odds_value_key:
                        if not (odd['odd']):
                            odd['odd'] = 0
                        return float(odd['odd']) 
    except (KeyError, IndexError, ValueError ) as err:
        return 0
    return 0

def recommendation_extract_feature(bets_results, upcoming_fixtures, old_fixtures):
    response_dict = {}
    match_pond_score = []
    print('aca entro?')
    for request in bets_results:
        if response_dict.get(request['result']) is None:
            response_dict[request['result']] = {'won': 0, 'lost': 0, 'odds': 0}

        if request['status'] == 'won':
            response_dict[request['result']]['won'] += int(request['quantity'])
            response_dict[request['result']]['odds'] += (int(request['quantity']) * get_odd_value(request['fixture_id'],
                                                request['result'], old_fixtures))
        elif request['status'] == 'lost':
            response_dict[request['result']]['lost'] += int(request['quantity']) 
    print(response_dict)
    for fixture in upcoming_fixtures:
        league_round = float(fixture['league']['round'].split(' ')[-1])

        if response_dict.get(fixture['homeTeam']['name']):
            score = get_score(response_dict[fixture['homeTeam']['name']], league_round)
            match_pond_score.append((fixture['id'], score))

        if response_dict.get(fixture['awayTeam']['name']):
            score = get_score(response_dict[fixture['awayTeam']['name']], league_round)
            match_pond_score.append( (fixture['id'], score))
    print(match_pond_score)
    return match_pond_score

def get_score(team_data, league_round):
    won_value = team_data['won']
    sum_odds = team_data['odds']
    if sum_odds == 0:
        return 0
    score = (won_value * league_round)/sum_odds
    print(score)
    return score

def recommendation_return_best(bets_results, upcoming_fixtures, old_fixtures):
    if not bets_results:
        return []
    match_pond_score = recommendation_extract_feature(bets_results, upcoming_fixtures, old_fixtures)
    sorted_match_pond_score = sorted(match_pond_score, key=lambda x: x[1], reverse=True)
    if len(sorted_match_pond_score) <=3:
        return sorted_match_pond_score 
    return sorted_match_pond_score[:3]