FROM ubuntu:latest
LABEL authors="azama"

ENTRYPOINT ["top", "-b"]