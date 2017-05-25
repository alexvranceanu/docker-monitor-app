import unittest
import urllib.error
import urllib.parse
import urllib.request
from utils.logger import Logger
import os

log = Logger().setup('test_remote_api')
log.setLevel(9)


def _get(host, endpoint, parameters=None):
    """
    :param host: Remote host to connect to including protocol (eg. http://localhost:5000)
    :param endpoint: URL Path to append (eg. /api/nodes)
    :param parameters: Map with URL parameters to append to the URL (eg. {"host":"local","zone":"eu-west1-b"})
    :return: If successful: [response_code, response_data], If any errors: False
    """

    if parameters is None:
        parameters = {}
    api_path = host + endpoint

    # Check if we should append any parameters to the URL
    if len(parameters) > 0:
        api_path += '?'
        for item in parameters:
            api_path += '&' + item + '=' + str(parameters.get(item))

    # Create the Request object with authentication headers
    request = urllib.request.Request(api_path)

    try:
        # Connect
        con = urllib.request.urlopen(request, timeout=10)
        # Read content response and response code
        data = con.read().decode("utf-8")
        code = con.getcode()

        # Check if response code is 200 (ok)
        if code == 200:
            log.debug("_get: ok, data: %s", data)
            return code, data
    # Catch any errors
    except urllib.request.URLError as e:
        try:
            if e.code >= 400:
                return e.code, e.fp.read()
        except:
            # Handle any other errors
            return False
    finally:
        try:
            # Close connection
            if con:
                con.close()
        except:
            pass

class RemoteAPI(unittest.TestCase):
    """ Tests for REST API"""

    def setUp(self):
        self.remote_host = os.getenv("REMOTE_HOST", "localhost")
        self.remote_port = os.getenv("REMOTE_PORT", "5000")
        self.endpoint = "http://"+str(self.remote_host)+":"+str(self.remote_port)
        self.version = os.getenv("VERSION", "1.0")
        self.env = os.getenv("ENV", "DEV")


    def test_get_ping(self):
        result = _get(self.endpoint, "/ping")
        self.assertEqual(200, result[0])

    def test_get_version(self):
        result = _get(self.endpoint, "/version")
        self.assertEqual(self.version, result[1])

    def test_get_env(self):
        result = _get(self.endpoint, "/env")
        self.assertEqual(self.env, result[1])

if __name__ == 'main':
    unittest.main()