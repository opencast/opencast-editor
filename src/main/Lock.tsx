import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { settings } from "../config";
import { setLock, video } from "../redux/videoSlice";
import { client } from "../util/client";
import { useInterval } from "../util/utilityFunctions";


const Lock: React.FC<{}> = () => {

  const dispatch = useDispatch();

  const lockingActive = useSelector((state: { videoState: { lockingActive: video["lockingActive"] } }) => state.videoState.lockingActive);
  const lockRefresh = useSelector((state: { videoState: { lockRefresh: video["lockRefresh"] } }) => state.videoState.lockRefresh);
  const lock = useSelector((state: { videoState: { lock: video["lock"] } }) => state.videoState.lock);

  let endpoint = `${settings.opencast.url}/editor/${settings.id}/editorLock`
  let body = lock
  let delay = lockRefresh

  // Tell Opencast if we want to lock
  useEffect(() => {
    if (lockingActive) {
      client.lock(endpoint, body);
      body.lockRefresh = true;
      dispatch(setLock(body))
    }
    // put client.release code here?

  // Only run this when the locking state changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lockingActive])

  // Refresh locking state?
  useInterval( async () => {
    await client.refresh(endpoint, body)
  }, delay);

  return (<></>);
}

export default Lock;
