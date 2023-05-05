import React, { useCallback, useEffect, useState } from "react";
import { faLock } from "@fortawesome/free-solid-svg-icons";

import { settings } from "../config";
import { useDispatch, useSelector } from "react-redux";
import { setError } from "../redux/errorSlice";
import { setLock, video } from "../redux/videoSlice";
import { client } from "../util/client";

const Lock: React.FC<{}> = () => {
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
  const [state, setState] = useState({
    lockingActive: lockingActive,
    lockRefresh: lockRefresh,
    lockState: lockState,
    lock: lock
  });

  let endpoint = `${settings.opencast.url}/editor/${settings.id}/lock`

  const requestLock = useCallback(() => {
    const form: string = `user=${state.lock.user}&uuid=${state.lock.uuid}`;
    client.post(endpoint, form, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8"
      }
    })
    .then(() => {
      lockDispatch();
    })
    .catch((error: string) => {
      if (error.includes("409")) {
        setState({
          lockingActive: state.lockingActive,
          lockState: state.lockState,
          lock: state.lock,
          lockRefresh: state.lockRefresh
        });
        errorDispatch(setError({
          error: true,
          errorDetails: error,
          errorIcon: faLock,
          errorTitle: 'Editor locked',
          errorMessage: 'This video is currently being edited by another user'
        }));
      }
    });
  }, [endpoint, errorDispatch, state.lock, lockDispatch, state.lockRefresh, state.lockState, state.lockingActive, setState]);

  const releaseLock = useCallback(() => {
    client.delete(`${endpoint}/${state.lock.uuid}`, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      }
    })
    .then(() => {
      dispatch(setLock(false));
      setState({
        lockingActive: false,
        lockRefresh: state.lockRefresh,
        lockState: false,
        lock: {user: '', uuid: ''}
      });
  })
    .catch((error: Error) => {
      console.error(error);
    });
  }, [dispatch, endpoint, state.lock.uuid, state.lockRefresh]);

  useEffect(() => {
    const releaseLockState = () => {
      if (state.lock && state.lock.user && state.lock.uuid) {
        releaseLock();
      }
    };

    if (state.lock && !state.lock.user && !state.lock.uuid
        && lock.user && lock.uuid) {
          setState({
            lock: lock,
            lockingActive: lockingActive,
            lockRefresh: lockRefresh,
            lockState: lockState
          });
    }

    if (state.lock && state.lock.user && state.lock.uuid) {
      requestLock();
    }

    window.addEventListener('beforeunload', releaseLockState);
    return () => {
      releaseLockState();
      window.removeEventListener('beforeunload', releaseLockState);
    }
  }, [state, lockRefresh, requestLock, releaseLock, lock, lockState, lockingActive]);

  return (<></>);
}

export default Lock;
