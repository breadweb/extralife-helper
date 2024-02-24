#!/usr/bin/env python

"""
Updates the mock API static files to help test development of the Helper.
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

    parser_donate = subparsers.add_parser(
        'donate',
         help='adds one more more test donations')
    parser_donate.add_argument(
        'type', nargs='?', choices=['participant', 'team'], default='participant',
         help='the type of donation to make')
    parser_donate.add_argument(
        'total', nargs='?', type=int, default=1,
        help='the total number of donations to add')
    parser_donate.add_argument(
        'amount', nargs='?', type=float, default=0.00,
        help='the amount of the donation(s) or leave blank for random amounts')

    args = parser.parse_args()
    return args


def reset(paths):
    """
    Resets all mock API testing files.
    """
    contents = ''

    with open(paths['participants_info'], 'r') as read_file:
        contents = json.load(read_file)
    contents['sumDonations'] = 0.00
    contents['sumPledges'] = 0.00
    contents['numDonations'] = 0

    with open(paths['participants_info'], 'w') as write_file:
        json.dump(contents, write_file, sort_keys=True, ensure_ascii=False, indent=4)

    with open(paths['teams_info'], 'r') as read_file:
        contents = json.load(read_file)
    contents['sumDonations'] = 0.00
    contents['sumPledges'] = 0.00
    contents['numDonations'] = 0

    with open(paths['teams_info'], 'w') as write_file:
        json.dump(contents, write_file, sort_keys=True, ensure_ascii=False, indent=4)

    with open(paths['participants_donations'], 'w') as write_file:
        json.dump([], write_file, sort_keys=True, ensure_ascii=False, indent=4)

    with open(paths['teams_donations'], 'w') as write_file:
        json.dump([], write_file, sort_keys=True, ensure_ascii=False, indent=4)


def get_random_display_name():
    """
    Returns a random name.
    """
    return [
        'Malvina Ronald', 'Kayly María Lourdes', 'Demelza Maggie', 'Michaël Angèle', 'Clint Ashlie',
        'Rickie Lizzy', 'Joceline Hellen', 'Nelson Theresa', 'Pascal Brylee', 'Kylan Hermógenes',
        'Tatum Desi', 'Sabella Mollie', 'Sherley Dashiell', 'Nate Kristi', 'Sheila Martha'
    ][random.randrange(0, 14)]


def get_random_donation_message():
    """
    Returns a donation message.
    """
    return [
        '',
        'You\'ve almost reached your goal!',
        '¡Casi has alcanzado tu objetivo!',
        'Vous avez presque atteint votre objectif!',
        '18 hours of games and still going? Amazing. Keep up the great work! Love, Mom and Dad.',
        '¿18 horas de juegos y sigues adelante? Asombroso. ¡Mantener el buen trabajo! Con cariño, mamá y papá.',
        '18 heures de jeux et ça continue? Incroyable. Continuez ce bon travail! Amour, maman et papa.',
        'Great job!',
        '¡Gran trabajo!',
        'Bon travail!',
    ][random.randrange(0, 9)]


def add_donations(args, paths):
    """
    Adds one or more test donations.
    """
    donation_base = {
        'links': {
            'recipient': 'https://www.extra-life.org/index.cfm?fuseaction=donorDrive.participant&participantID=531439',
            'donate': 'https://www.extra-life.org/index.cfm?fuseaction=donorDrive.participant&participantID=531439#donate'
        },
        'isPledge': False,
        'isFromFacebook': False,
        'thankYouSent': False,
        'recipientImageURL': 'https://donordrivecontent.com/extralife/images/$avatars$/constituent_574EE92A-C29F-F29A-60B307827DB9F948.jpg',
        'participantID': 531439,
        'displayNameVisibility': 'ALL',
        'isOffline': False,
        'isFulfilled': True,
        'eventID': 554,
        'isRegFee': False,
        'createdDateUTC': '2024-01-26T23:02:15.817+0000',
        'amountVisibility': 'ALL',
        'recipientName': 'Adam Slesinger',
        'avatarImageURL': 'https://donordrivecontent.com/extralife/images/$avatars$/constituent_EB86576B-C293-34EB-4D85AC4CF292DE8B.jpg',
        'teamID': 66495,
        'messageVisibility': 'ALL'
    }

    info_path = paths['{0}s_info'.format(args.type)]
    donations_path = paths['{0}s_donations'.format(args.type)]

    for n in range(args.total):
        donation = donation_base.copy()
        amount = args.amount if args.amount else float(decimal.Decimal(random.randrange(1,100000))/100)
        donation['amount'] = amount
        donation['donorID'] = str(uuid.uuid4()).upper().replace('-', '')[0:15]
        donation['donationID'] = str(uuid.uuid4()).upper().replace('-', '')[0:15]
        donation['displayName'] = get_random_display_name()
        donation['message'] = get_random_donation_message()

        contents = ''
        with open(donations_path, 'r') as read_file:
            contents = json.load(read_file)
        contents.insert(0, donation)
        with open(donations_path, 'w') as write_file:
            json.dump(contents, write_file, sort_keys=True, ensure_ascii=False, indent=4)
        with open(info_path, 'r') as read_file:
            contents = json.load(read_file)
        contents['sumDonations'] = contents['sumDonations'] + amount
        contents['numDonations'] = contents['numDonations'] + 1
        with open(info_path, 'w') as write_file:
            json.dump(contents, write_file, sort_keys=True, ensure_ascii=False, indent=4)


def main():
    """
    Entry point for the script. Runs appropriate deploy actions based on parameters.
    """
    args = process_args()

    base_dir = os.path.join(os.path.dirname(__file__), '..', 'mock-api', 'api')
    paths = {
        'participants_info': os.path.join(base_dir, 'participants', '531439', 'index.html'),
        'participants_donations': os.path.join(base_dir, 'participants', '531439', 'donations', 'index.html'),
        'teams_info': os.path.join(base_dir, 'teams', '66495', 'index.html'),
        'teams_donations': os.path.join(base_dir, 'teams', '66495', 'donations', 'index.html')
    }

    if args.action == 'reset':
        reset(paths)
        print('Reset complete!')
    elif args.action == 'donate':
        add_donations(args, paths)
        print('{0} dontaion{1} added!'.format(args.total, '' if args.total == 1 else 's'))


if __name__ == '__main__':
    main()
