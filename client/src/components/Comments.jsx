/* eslint-disable react/prop-types */
import React, { useRef, useState, useEffect } from "react";
import axios from "axios";
import CommentForm from "./CommentForm";
import CommentsList from "./CommentsList";
import { useTranslation } from "react-i18next";
import ErrorDiv from "./ErrorDiv";

import { useSelector, useDispatch } from "react-redux";
import { setComments, setCount, loadOlderComments } from "./../_actions";

// eslint-disable-next-line react/prop-types
const Comments = ({ url }) => {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [loadMore, setLoadMore] = useState(false);
  const loaded = useRef(false);
  const { t } = useTranslation();
  const auth = useSelector((state) => state.auth);
  const count = useSelector((state) => state.count);
  const dispatch = useDispatch();

  useEffect(() => {
    if (loaded.current === false) {
      setLoading(true);
      axios({
        method: "post",
        url: process.env.REACT_APP_API_SERVER + "/api/getcomments",
        data: {
          url,
          authKey: auth.authKey,
          page,
        },
      }).then((res) => {
        setLoading(false);

        if (res.data.meta) {
          if (page === 0) {
            dispatch(setComments(res.data.meta));
            dispatch(setCount(res.data.page.count));
            if (res.data.page.count > 30) setLoadMore(true);
          } else {
            dispatch(loadOlderComments(res.data.meta));
            res.data.meta.length === 30
              ? setLoadMore(true)
              : setLoadMore(false);
          }
          setError("");
        } else {
          setError(res.data.error);
        }
      });

      loaded.current = true;
    }
  }, [page]);

  return (
    <div>
      <div className="flex flex-col items-center justify-between">
        <div className="bg-white dark:bg-gray-600 w-full text-teal text-sm rounded-lg shadow-md px-4 py-2 m-3 border-1 border-gray-400">
          <span className="inline-flex bg-gray-700 text-white rounded-full h-6 px-3 justify-center items-center">
            <strong>{t("Page")}:</strong>
            <span className="ml-2">{url}</span>
          </span>

          <div className="dark:text-gray-300 flex p-2 px-2 text-gray-700">
            {count} {count > 1 ? t("comments") : t("comment")}
          </div>
        </div>

        {loading && (
          <div className="px-4 py-5 rounded-t sm:px-6">
            <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md">
              <div className="inline-flex items-center bg-white leading-none  rounded-full p-2 shadow text-teal text-sm">
                <span className="inline-flex px-2 text-gray-700">
                  {t("Loading...")}
                </span>
              </div>
            </div>
          </div>
        )}

        {loadMore && !loading && (
          <button
            className="px-2 py-1 text-gray-700 bg-gray-200 rounded-md hover:bg-teal-400 hover:text-white text-teal text-sm"
            style={{ transition: "all 0.2s ease" }}
            onClick={() => {
              loaded.current = false;
              setPage((prev) => prev + 1);
            }}
          >
            {t("Load older comments")}
          </button>
        )}
      </div>
      {error && <ErrorDiv error={error} />}

      <CommentsList url={url} t={t} />
      <CommentForm url={url} t={t} />
    </div>
  );
};

export default Comments;
