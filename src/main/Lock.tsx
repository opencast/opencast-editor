import React, { useEffect } from "react";
import { faLock } from "@fortawesome/free-solid-svg-icons";

import { useDispatch, useSelector } from "react-redux";
import { settings } from "../config";
import { setLock, video } from "../redux/videoSlice";
import { selectIsEnd } from '../redux/endSlice'
import { setError } from "../redux/errorSlice";
import { client } from "../util/client";
import { useInterval } from "../util/utilityFunctions";
import { useBeforeunload } from 'react-beforeunload';

const Lock: React.FC = () => {
  const endpoint = `${settings.opencast.url}/editor/${settings.id}/lock`

  const dispatch = useDispatch();
  const lockingActive = useSelector((state: { videoState: { lockingActive: video["lockingActive"] } }) => state.videoState.lockingActive);
  const lockRefresh = useSelector((state: { videoState: { lockRefresh: video["lockRefresh"] } }) => state.videoState.lockRefresh);
  const lockState = useSelector((state: { videoState: { lockState: video["lockState"] } }) => state.videoState.lockState);
  const lock = useSelector((state: { videoState: { lock: video["lock"] } }) => state.videoState.lock);
  const isEnd = useSelector(selectIsEnd)

  function requestLock() {
    const form = `user=${lock.user}&uuid=${lock.uuid}`;
    client.post(endpoint, form, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
      }
    })
    .then(() => dispatch(setLock(true)))
    .catch((error: string) => {
      dispatch(setLock(false))
      dispatch(setError({
        error: true,
        errorDetails: error,
        errorIcon: faLock,
        errorTitle: 'Video editing locked',
        errorMessage: 'This video is currently being edited by another user'
      }))
    })
  }

  function releaseLock() {
    if (lockingActive && lockState) {
      client.delete(endpoint + '/' + lock.uuid)
      .then(() => {
        console.info('Lock released')
        dispatch(setLock(false));
      })
    }
  }

  // Request lock
  useEffect(() => {
    if (lockingActive) {
      requestLock()
    }
  }, [lockingActive])

  // Refresh lock
  useInterval(async () => {
    requestLock()
  }, lockingActive ? lockRefresh : null);

  // Release lock on leaving page
  useBeforeunload((_event: { preventDefault: () => void; }) => {
    releaseLock()
  })

  // Release lock on discard
  useEffect(() => {
    if (isEnd) {
      releaseLock()
    }
  }, [isEnd])

  return (<></>)
}

export default Lock;
