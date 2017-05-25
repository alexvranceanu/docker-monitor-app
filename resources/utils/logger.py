import logging


class Logger(object):
    def __init__(self):
        pass

    def setup(self, name):
        log = logging.getLogger(name)
        handler = logging.StreamHandler()
        formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
        handler.setFormatter(formatter)
        log.addHandler(handler)
        log.setLevel(logging.DEBUG)
        log.propagate = False
        return log
