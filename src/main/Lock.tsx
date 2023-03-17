import React, { useCallback, useEffect, useState } from "react";
import { faLock } from "@fortawesome/free-solid-svg-icons";

import { settings } from "../config";
import { useDispatch, useSelector } from "react-redux";
import { setError } from "../redux/errorSlice";
import { LockData, setLock, video } from "../redux/videoSlice";
import { client } from "../util/client";

export type ILock = {
  lockingActive: boolean;
  lockRefresh: number;
  lockState: boolean;
  lock: LockData;
};

const Lock: React.FC<{}> = () => {
  const [state, setState] = useState({
    lockingActive: false,
    lockRefresh: 6000,
    lockState: false,
    lock: {uuid: '', user: ''}
  });
  const dispatch = useDispatch();
  const lockDispatch = useCallback(() => dispatch({
    type: 'SET_LOCK',
    lockingActive: true,
    lockRefresh: 6000,
    lockState: false,
    lock: {uuid: '', user: ''}
  }), [dispatch]);
  const errorDispatch = useDispatch();
  const lockingActive = useSelector((state: { videoState: { lockingActive: video["lockingActive"] } }) => state.videoState.lockingActive);
  const lockRefresh = useSelector((state: { videoState: { lockRefresh: video["lockRefresh"] } }) => state.videoState.lockRefresh);
  const lockState = useSelector((state: { videoState: { lockState: video["lockState"] } }) => state.videoState.lockState);
  const lock = useSelector((state: { videoState: { lock: video["lock"] } }) => state.videoState.lock);

  let endpoint = `${settings.opencast.url}/editor/${settings.id}/lock`

  function requestLock() {
    client.post(endpoint, lock)
    .then(() => {
      lockDispatch();
    })
    .catch((error: string) => {
      setState({
        lockingActive: lockingActive,
        lockState: lockState,
        lock: lock,
        lockRefresh: lockRefresh
      });
      errorDispatch(setError({
        error: true,
        errorDetails: error,
        errorIcon: faLock,
        errorTitle: 'Editor locked',
        errorMessage: 'This video is currently being edited by another user'
      }));
    });
  };

  function releaseLock() {
    client.delete(`${endpoint}/${lock.uuid}`)
    .then(() => {
      dispatch(setLock(false));
    })
    .catch((error: Error) => {
      console.error(error);
    });
  };

  useEffect(() => {
    const releaseLockState = () => {
      if (lock.user && lock.uuid) {
        releaseLock();
        setState({
          lockingActive: false,
          lockRefresh: lockRefresh,
          lockState: false,
          lock: {user: '', uuid: ''}
        });
      }
    };

    if (lock.user && lock.uuid && !lockingActive) {
      requestLock();
    }

    window.addEventListener('beforeunload', releaseLockState);
    return () => {
      releaseLockState();
      window.removeEventListener('beforeunload', releaseLockState);
    }
  }, [lock, lockingActive, lockRefresh]);

  return (<></>);
}

export default Lock;
