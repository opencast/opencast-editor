import React, { useCallback, useEffect, useState } from "react";
import { faLock } from "@fortawesome/free-solid-svg-icons";

import { settings } from "../config";
import { useDispatch, useSelector } from "react-redux";
import { setError } from "../redux/errorSlice";
import { LockData, video } from "../redux/videoSlice";
import { client } from "../util/client";

const Lock: React.FC<{}> = () => {
  const errorDispatch = useDispatch();
  const lock: LockData = useSelector((state: { videoState: { lock: video["lock"] } }) => state.videoState.lock);
  const [state, setState] = useState({
    active: lock.active,
    refresh: lock.refresh,
    state: lock.state,
    user: lock.user,
    uuid: lock.uuid
  });

  let endpoint = `${settings.opencast.url}/editor/${settings.id}/lock`

  const isInitialState = useCallback((): boolean => {
    return state.user === '' && state.uuid === '' && lock.user !== '' && lock.uuid !== '' && state.state === '';
  }, [lock.user, lock.uuid, state.state, state.user, state.uuid]);

  const canRequestLock = useCallback((): boolean => {
    return state.user !== '' && state.uuid !== '' && !state.active && !state.state;
  }, [state.user, state.uuid, state.active, state.state]);

  const canReleaseLock = useCallback((): boolean => {
    return state.user !== '' && state.uuid !== '' && state.active;
  }, [state.user, state.uuid, state.active]);

  const initialLockState = useCallback(() => {
    setState({
      active: lock.active,
      refresh: lock.refresh,
      state: lock.state,
      user: lock.user,
      uuid: lock.uuid
    });
  }, [lock.active, lock.refresh, lock.state, lock.user, lock.uuid]);

  const requestLock = useCallback(() => {
    const form: string = `user=${state.user}&uuid=${state.uuid}`;
    client.post(endpoint, form, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8"
      }
    })
    .then(() => {
      setState({
        active: true,
        state: 'locked',
        refresh: state.refresh,
        user: state.user,
        uuid: state.uuid
    });
    })
    .catch((error: string) => {
      if (error.includes("409")) {
        errorDispatch(setError({
          error: true,
          errorDetails: error,
          errorIcon: faLock,
          errorTitle: 'Editor locked',
          errorMessage: 'This video is currently being edited by another user'
        }));
      }
    });
  }, [endpoint, errorDispatch, state.refresh, state.user, state.uuid]);

  const releaseLock = useCallback(() => {
    client.delete(`${endpoint}/${state.uuid}`, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      }
    })
    .then(() => {
      setState({
        active: false,
        refresh: state.refresh,
        state: '',
        user: state.user,
        uuid: state.uuid
      });
  })
    .catch((error: Error) => {
      console.error(error);
    });
  }, [endpoint, state.refresh, state.user, state.uuid]);

  const refreshLock = useCallback(() => {
    requestLock();
  }, [requestLock]);

  useEffect(() => {
    let refresh: ReturnType<typeof setTimeout>;

    if (isInitialState()) {
      initialLockState();
    }

    return () => {
      clearInterval(refresh);
    }
  }, [initialLockState, isInitialState, state]);

  useEffect(() => {
    if (canRequestLock()) {
      requestLock();
    }

    return () => {
    }
  }, [canRequestLock, requestLock]);

  useEffect(() => {
    let refresh: ReturnType<typeof setTimeout>;

    if (state.active && state.state === 'locked') {
      refresh = setInterval(() => {
        refreshLock();
      }, state.refresh);
    }

    return () => {
      clearInterval(refresh);
    }
  }, [refreshLock, state.active, state.refresh, state.state]);

  useEffect(() => {
    window.addEventListener('beforeunload', releaseLock);
    return () => {
      window.removeEventListener('beforeunload', releaseLock);
    }
  }, [canReleaseLock, state, releaseLock]);

  return (<></>);
}

export default Lock;
