#!/bin/sh
# Rolls out a new image of the A3 FOR YOU site on the server.
# Streamed over SSH by .gitlab-ci.yml (`ssh host "VAR=… sh -s" < deploy/deploy.sh`), nothing is stored on the server.
#
# Expected environment:
#   IMAGE      full image name, e.g. registry.gitlab.com/group/a3-web:latest
#   CONTAINER  container name (a3-site / a3-site-dev)
#   PORT       optional: also publish 127.0.0.1:<PORT> on the host (the container itself listens on 3000);
#              not needed when nginx reaches it by name inside NETWORK
#   VOLUME     docker volume with the admin data (catalogue JSON + uploaded photos)
#   ENV_FILE   file with ADMIN_PASSWORD / ADMIN_SESSION_SECRET, removed when the script ends
#   NETWORK    docker network shared with the nginx container (it proxies to <CONTAINER>:3000)
#
# The old container is kept until the new one answers /api/health; if it does not,
# the old one is started again, so a broken build never takes the site down.
# @author Erbol king
set -eu

trap 'rm -f "$ENV_FILE"' EXIT

echo "==> pull $IMAGE"
docker pull "$IMAGE"

docker rm -f "$CONTAINER-old" >/dev/null 2>&1 || true
had_old=0
if docker inspect "$CONTAINER" >/dev/null 2>&1; then
  # never replace somebody else's container that happens to have the same name
  if [ "$(docker inspect -f '{{ index .Config.Labels "a3.site" }}' "$CONTAINER")" != "1" ]; then
    echo "!! container $CONTAINER exists but was not started by this pipeline; refusing to replace it"
    exit 1
  fi
  docker rename "$CONTAINER" "$CONTAINER-old"
  docker stop "$CONTAINER-old" >/dev/null
  had_old=1
fi

rollback() {
  echo "!! new container is not healthy, rolling back"
  docker logs --tail 40 "$CONTAINER" 2>&1 || true
  docker rm -f "$CONTAINER" >/dev/null 2>&1 || true
  if [ "$had_old" = 1 ]; then
    docker rename "$CONTAINER-old" "$CONTAINER"
    docker start "$CONTAINER" >/dev/null
  fi
  exit 1
}

echo "==> start $CONTAINER${NETWORK:+ in network $NETWORK}${PORT:+, host port 127.0.0.1:$PORT}"
# shellcheck disable=SC2086
docker run -d \
  --name "$CONTAINER" \
  --restart unless-stopped \
  --label a3.site=1 \
  ${PORT:+-p "127.0.0.1:$PORT:3000"} \
  -v "$VOLUME:/data" \
  --env-file "$ENV_FILE" \
  ${NETWORK:+--network "$NETWORK"} \
  "$IMAGE" >/dev/null || rollback

tries=0
until docker exec "$CONTAINER" wget -qO- http://127.0.0.1:3000/api/health >/dev/null 2>&1; do
  tries=$((tries + 1))
  [ "$tries" -ge 30 ] && rollback
  sleep 2
done

[ "$had_old" = 1 ] && docker rm -f "$CONTAINER-old" >/dev/null
echo "==> $CONTAINER is up"
