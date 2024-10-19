#!/usr/bin/env python

"""
This is an extension of Python's built-in Simple HTTP Server module. It disables CORS and caching
which are two things typically not desired when iterating in a local development environment. It also
supports hosting single page applications with the --not-found-page argument and simulating error
responses such as 429, 500, etc.
"""

import argparse
import os
import sys
from functools import partial
from http import HTTPStatus, server

__author__ = 'Adam "Bread" Slesinger'
__version__ = '1.1.0'

def process_args():
    """
    Parses command line arguments.
    """
    description = '\nStatic Asset Server, version {0}'.format(__version__)
    parser = argparse.ArgumentParser(
        description=description, formatter_class=argparse.RawTextHelpFormatter)
    cwd = os.getcwd()
    parser.add_argument(
        'directory', nargs='?', default=cwd,
        help=f'root directory for serving static assets (default: {cwd})'
    )
    parser.add_argument(
        '-p', '--port', dest='port', default=8000, type=int,
        help='port to be used by the server (default: 8000)'
    )
    parser.add_argument(
        '-n', '--not-found-page', dest='not_found_page', default=None,
        help='an optional page to serve when the requested resource does not exist'
    )
    parser.add_argument(
        '--use-caching', action='store_true',
        help='enable caching (default: False)'
    )
    parser.add_argument(
        '--use-cors', action='store_true',
        help='enable cross-origin (CORS) protection (default: False)'
    )
    parser.add_argument(
        '--status-code', dest='status_code', choices=['404', '429', '500'], default=None,
        help='force a response with a status code for testing (default: None)'
    )
    args = parser.parse_args()
    return args


class CustomSimpleHTTPRequestHandler(server.SimpleHTTPRequestHandler):
    def __init__(self, cli_args, *args, **kwargs):
        self.cli_args = cli_args
        super().__init__(*args, **kwargs)


    def do_GET(self):
        if self.cli_args.status_code is not None:
            status_code = int(self.cli_args.status_code)
            self.send_response(status_code)
            self.end_headers()
            message = ''
            if status_code == 404:
                message = 'Not Found'
            elif status_code == 429:
                message = 'Too Many Requests'
            elif status_code == 500:
                message = 'Server Error'
            self.wfile.write(str.encode(message))
            return

        # Setting the 'If-Modified-Since' header date to the past before executing the requst
        # ensures that the resource is always served.
        if not self.cli_args.use_caching:
            try:
                self.headers.replace_header('If-Modified-Since', 'Thu, 1 Jan 1970 00:00:00 GMT')
            except KeyError:
                pass

        # If the path doesn't exist and a not found page was specified, serve that page.
        path = self.translate_path(self.path)
        if not os.path.exists(path) and self.cli_args.not_found_page != None:
            self.path = self.cli_args.not_found_page

        server.SimpleHTTPRequestHandler.do_GET(self)


    def end_headers(self):
        if not self.cli_args.use_cors:
            # Allow code from any origin to access resources from this server.
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Access-Control-Allow-Credentials', 'true')
            self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
            self.send_header('Access-Control-Allow-Headers', (
                'DNT, X-Mx-ReqToken, Keep-Alive, User-Agent, X-Requested-With '
                'If-Modified-Since, Cache-Control, Content-Type'
            ))

        if not self.cli_args.use_caching:
            # Set headers to inform clients to disable all caching.
            self.send_header('Cache-Control', 'max-age=0, no-cache, no-store, must-revalidate, proxy-revalidate')
            self.send_header('Pragma', 'no-cache')
            self.send_header('Expires', '0')
            self.send_header(
                'Note', 'If-Modified-Since request header ignored. Response headers are set to disable caching.'
            )

        server.SimpleHTTPRequestHandler.end_headers(self)


    def log_message_to_correct_descriptor(self, descriptor, format, *args):
        # This does the same thing as log_message function in the base class except that also accepts
        # a descriptor parameter for sending to standard output or standard error and not just the latter.
        message = format % args
        descriptor.write(
            '%s - - [%s] %s\n' %
            (self.address_string(),
            self.log_date_time_string(),
            message.translate(self._control_char_table))
        )


    def log_request(self, code='-', size='-'):
        # Does the same as the log_request in base class except that it uses the log_message alternative
        # to send to standard output.
        if isinstance(code, HTTPStatus):
            code = code.value
        self.log_message_to_correct_descriptor(sys.stdout, '"%s" %s %s', self.requestline, str(code), str(size))


    def log_error(self, format, *args):
        # Does the same as the log_request in base class except that it uses the log_message alternative
        # to send to standard error.
        self.log_message_to_correct_descriptor(sys.stderr, format, *args)


def exit_with_error(message = None):
    """
    Terminates the current script with a non-success exit code.
    """
    if message:
        print('\nSUCCESS: {0}\n'.format(message))
    sys.exit(1)


def main():
    """
    Entry point for the script.
    """
    args = process_args()
    directory = os.path.realpath(args.directory)

    print()
    print('Static Asset Server by Adam "Bread" Slesinger')
    print()
    print(f'Server Root: {directory}')
    print(f'Port: {args.port}')
    print(f'Use Caching: {args.use_caching}')
    print(f'Use CORS: {args.use_cors}')
    print(f'Not Found Page: {args.not_found_page}')
    print(f'Mock Status Code: {args.status_code}')
    print()

    if args.port == 80:
        exit_with_error('ERROR: Port 80 can not be used because it requires elevated permissions.')
        sys.exit(0)

    if not os.path.exists(directory):
        exit_with_error(f'Invalid path: {directory}')

    handler_class = partial(CustomSimpleHTTPRequestHandler, args, directory=directory)
    address = ('', args.port)
    httpserver = None

    try:
        httpserver = server.ThreadingHTTPServer(address, handler_class)
    except OSError as err:
        if str(err) == '[Errno 48] Address already in use':
            exit_with_error(f'Server could not start. Port {args.port} is in use.')
        else:
            exit_with_error(f'Server could not start: {err}')
    try:
        print('Listening for requests...')
        httpserver.serve_forever()
    except KeyboardInterrupt:
        print('Server terminated.')


if __name__ == '__main__':
    main()
