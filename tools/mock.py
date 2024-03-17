#!/usr/bin/env python

"""
Updates the mock API static files to help with testing and development of the Helper.
"""

import argparse
import decimal
import json
import os
import random
import uuid

__author__ = 'Adam "Bread" Slesinger'
__version__ = '1.0.0'

def process_args():
    """
    Parses command line arguments.
    """
    description = 'Mock Manager, version {0}'.format(__version__)
    parser = argparse.ArgumentParser(
        description=description,
        formatter_class=argparse.ArgumentDefaultsHelpFormatter)

    subparsers = parser.add_subparsers(help='action to take', dest='action')

    subparsers.add_parser(
        'reset',
         help='removes all donations and sets totals to zero')

    parser_totals = subparsers.add_parser(
        'set-totals',
         help='sets raised and goal amounts')
    parser_totals.add_argument(
        'total', type=float,
         help='the amount to set for the total raised')
    parser_totals.add_argument(
        'goal', type=float,
         help='the amount to set for the goal')
    parser_totals.add_argument(
        'type', nargs='?', choices=['participant', 'team'], default='participant',
         help='the type of info to update')

    parser_add_donos = subparsers.add_parser(
        'add-donos',
         help='adds one more more test donations')
    parser_add_donos.add_argument(
        'total', nargs='?', type=int, default=1,
        help='the total number of donations to add')
    parser_add_donos.add_argument(
        'amount', nargs='?', type=float, default=0.00,
        help='the amount of the donation(s) or leave blank for random amounts')
    parser_add_donos.add_argument(
        '--anonymous', dest='anonymous', action='store_true',
        help='make the donation anonymous')
    parser_add_donos.add_argument(
        '--no-message', dest='no_message', action='store_true',
        help='do not include a message in the donation(s)')
    parser_add_donos.add_argument(
        '--lang', dest='lang', choices=['en', 'es', 'fr'],
        help='the language to use for donation names and messages')

    args = parser.parse_args()
    return args


def get_endpoint_content(path):
    """
    Returns the content of a mock endpoint file.
    """
    with open(path, 'r') as read_file:
        return json.load(read_file)


def set_endpoint_content(path, contents):
    """
    Sets the content of a mock endpoint file.
    """
    with open(path, 'w') as write_file:
        json.dump(contents, write_file, sort_keys=True, ensure_ascii=False, indent=4)


def get_random_display_name(args):
    """
    Returns a random name.
    """
    names_en = ['Kohen Cathryn', 'Ben Gaz', 'Cayla Ruth', 'Sheelagh Ronald', 'Gerrard Karrie']
    names_es = ['Noa Sancho', 'Libertad Bolívar', 'Ángel Florián', 'Yadira Evaristo', 'Ámbar Eloy']
    names_fr = ['Charles Candide', 'Angeline François-Marie', 'Armel Valéry', 'Lou Moïse', 'Rosine Viviane']

    if args.lang == 'en':
        return names_en[random.randrange(0, len(names_en) - 1)]
    elif args.lang == 'es':
        return names_es[random.randrange(0, len(names_es) - 1)]
    elif args.lang == 'fr':
        return names_fr[random.randrange(0, len(names_fr) - 1)]


def get_random_donation_message(args):
    """
    Returns a donation message.
    """
    messages_en = [
        'You\'ve almost reached your goal!',
        '18 hours of games and still going? Amazing. Keep up the great work! Love, Mom and Dad.',
        'Great job!',
    ]
    messages_es = [
        '¡Casi has alcanzado tu objetivo!',
        '¿18 horas de juegos y sigues adelante? Asombroso. ¡Mantener el buen trabajo! Con cariño, mamá y papá.',
        '¡Gran trabajo!',
    ]
    messages_fr = [
        'Vous avez presque atteint votre objectif!',
        '18 heures de jeux et ça continue? Incroyable. Continuez ce bon travail! Amour, maman et papa.',
        'Bon travail!',
    ]

    if args.no_message:
        return None
    elif args.lang == 'en':
        return messages_en[random.randrange(0, len(messages_en) - 1)]
    elif args.lang == 'es':
        return messages_es[random.randrange(0, len(messages_es) - 1)]
    elif args.lang == 'fr':
        return messages_fr[random.randrange(0, len(messages_fr) - 1)]


def reset(paths):
    """
    Resets all mock API endpoint files.
    """
    for path in [paths['participants_info'], paths['teams_info']]:
        contents = get_endpoint_content(path)
        contents['sumDonations'] = 0.00
        contents['sumPledges'] = 0.00
        contents['numDonations'] = 0
        contents['fundraisingGoal'] = 2000.00
        set_endpoint_content(path, contents)

    set_endpoint_content(paths['participants_donations'], [])
    set_endpoint_content(paths['teams_donations'], [])

    contents = get_endpoint_content(paths['participants_milestones'])
    for idx, milestone in enumerate(contents):
        if 'isComplete' in contents[idx]:
            del contents[idx]['isComplete']
    set_endpoint_content(paths['participants_milestones'], contents)


def set_totals(args, paths):
    """
    Explicitly sets the total amounts in the participant or team info mock API endpoint. Note
    that using this will result in totals not matching the sum of the mock donations.
    """
    path = paths['{0}s_info'.format(args.type)]

    contents = get_endpoint_content(path)
    contents['sumDonations'] = args.total
    contents['fundraisingGoal'] = args.goal
    set_endpoint_content(path, contents)


def add_donations(args, paths):
    """
    Adds one or more test donations to the donations and info mock endpoints.
    """
    link_base_url = 'https://www.extra-life.org/index.cfm?fuseaction=donorDrive.participant'
    image_base_url = 'https://donordrivecontent.com/extralife/images/$avatars$'

    donation_base = {
        'links': {
            'recipient': link_base_url + '&participantID=531439',
            'donate': link_base_url + '&participantID=531439#donate'
        },
        'isPledge': False,
        'isFromFacebook': False,
        'thankYouSent': False,
        'recipientImageURL': image_base_url + '/constituent_574EE92A-C29F-F29A-60B307827DB9F948.jpg',
        'participantID': 531439,
        'displayNameVisibility': 'ALL',
        'isOffline': False,
        'isFulfilled': True,
        'eventID': 554,
        'isRegFee': False,
        'createdDateUTC': '2024-01-26T23:02:15.817+0000',
        'amountVisibility': 'ALL',
        'recipientName': 'Adam Slesinger',
        'avatarImageURL': image_base_url + '/constituent_EB86576B-C293-34EB-4D85AC4CF292DE8B.jpg',
        'teamID': 66495,
        'messageVisibility': 'ALL'
    }

    if args.anonymous:
        del donation_base['displayNameVisibility']
        del donation_base['messageVisibility']

    contents_participants = get_endpoint_content(paths['participants_donations'])
    contents_team = get_endpoint_content(paths['teams_donations'])
    total_amount = 0

    for n in range(args.total):
        amount = args.amount if args.amount else float(decimal.Decimal(random.randrange(1,100000))/100)
        total_amount += amount
        name = get_random_display_name(args)
        message = get_random_donation_message(args)

        donation = donation_base.copy()
        donation['amount'] = amount
        if not args.anonymous:
            donation['donorID'] = str(uuid.uuid4()).upper().replace('-', '')[0:15]
        donation['donationID'] = str(uuid.uuid4()).upper().replace('-', '')[0:15]
        if not args.anonymous:
            donation['displayName'] = name
        donation['message'] = message

        print(f'Adding donation: {name} | {amount} | {message}')

        contents_participants.insert(0, donation)
        contents_team.insert(0, donation)

    set_endpoint_content(paths['participants_donations'], contents_participants)
    set_endpoint_content(paths['teams_donations'], contents_team)

    contents_participants = get_endpoint_content(paths['participants_info'])
    contents_team = get_endpoint_content(paths['teams_info'])

    contents_participants['sumDonations'] = contents_participants['sumDonations'] + total_amount
    contents_participants['numDonations'] = contents_participants['numDonations'] + args.total
    contents_team['sumDonations'] = contents_team['sumDonations'] + total_amount
    contents_team['numDonations'] = contents_team['numDonations'] + args.total

    set_endpoint_content(paths['participants_info'], contents_participants)
    set_endpoint_content(paths['teams_info'], contents_team)

    total_raised = contents_participants['sumDonations'] + contents_participants['sumPledges']

    milestones_path = paths['participants_milestones']
    contents = get_endpoint_content(milestones_path)
    for idx, milestone in enumerate(contents):
        if total_raised >= contents[idx]['fundraisingGoal']:
            contents[idx]['isComplete'] = True
    set_endpoint_content(milestones_path, contents)


def main():
    """
    Entry point for the script. Runs appropriate deploy actions based on parameters.
    """
    args = process_args()
    if 'lang' in args and not args.lang:
        args.lang = ['en', 'es', 'us'][random.randrange(0, 2)]

    base_dir = os.path.join(os.path.dirname(__file__), '..', 'mock-api', 'api')
    paths = {
        'participants_info': os.path.join(base_dir, 'participants', '531439', 'index.html'),
        'participants_donations': os.path.join(base_dir, 'participants', '531439', 'donations', 'index.html'),
        'participants_milestones': os.path.join(base_dir, 'participants', '531439', 'milestones', 'index.html'),
        'teams_info': os.path.join(base_dir, 'teams', '66495', 'index.html'),
        'teams_donations': os.path.join(base_dir, 'teams', '66495', 'donations', 'index.html')
    }

    if args.action == 'reset':
        reset(paths)
        print('Reset complete.')

    elif args.action == 'set-totals':
        set_totals(args, paths)
        print('Totals updated.')

    elif args.action == 'add-donos':
        add_donations(args, paths)
        print('{0} donation{1} added.'.format(args.total, '' if args.total == 1 else 's'))


if __name__ == '__main__':
    main()
