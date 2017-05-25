import unittest
from docker import DockerClient
from dockerevents import DockerEvents

class DockerInstanceTestCase(unittest.TestCase):
    """ Tests for `dockerevents.py`"""

    def setUp(self):
        self.classInstance = DockerEvents("", "", "", listen=False)

    def test_instance_type_is_dockerevents(self):
        self.assertIsInstance(self.classInstance, DockerEvents)

    def test_cli_type_is_dockerclient(self):
        self.assertIsInstance(self.classInstance.cli, DockerClient)

if __name__ == 'main':
    unittest.main()