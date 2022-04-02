import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./TodoList.css";

import { TodoistApi } from "@doist/todoist-api-typescript";

import LoadSpin from "../../components/loadSpin/LoadSpin";
import NewListForm from "../../components/newListForm/NewListForm";
import ProcessSpin from "../../components/processSpin/ProcessSpin";

export default function TodoList() {
  const navigate = useNavigate();
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [buttonTrigger, setButtonTrigger] = useState(true);
  const [taskData, setTaskData] = useState([]);
  // const [newList, setNewList] = useState([]);

  const api = new TodoistApi(`${process.env.REACT_APP_API_KEY}`);

  useEffect(() => {
    fetchData();
  }, [buttonTrigger]);

  const fetchData = () => {
    setIsLoading(true);
    api
      .getTasks()
      .then((tasks) => setTaskData(tasks))
      .catch((error) => console.log(error))
      .finally(() => {
        setIsReady(true);
      });
    setIsLoading(false);
  };

  const addHandle = async (title, descrip) => {
    await api
      .addTask({
        content: title,
        description: descrip,
      })
      .then((task) => console.log(task))
      .catch((error) => console.log(error));
    setButtonTrigger(!buttonTrigger);
  };

  const checkButton = async (id, value) => {
    if (value.slice(0, 16) === "(task completed)") {
      return false;
    } else {
      setIsLoading(true);
      await api
        .updateTask(id, { content: `(task completed) ${value}` })
        .then((isSuccess) => console.log(isSuccess))
        .catch((error) => console.log(error));

      setButtonTrigger(!buttonTrigger);
      setIsLoading(false);
    }
  };

  const deleteButton = async (id) => {
    setIsLoading(true);

    await api
      .closeTask(id)
      .then((isSuccess) => console.log(isSuccess))
      .catch((error) => console.log(error));

    setIsLoading(false);
    setButtonTrigger(!buttonTrigger); // bisa diganti langsung dengan memanggil function fetchData
  };

  const onSubmit = (e) => {
    e.preventDefault();
    console.log("refresh prevented");
  };

  let result;
  if (isReady) {
    result = (
      <>
        {isLoading ? <ProcessSpin /> : 0}
        {console.log(taskData)}
        <section className="todoListLayout">
          <NewListForm
            onSubmit={(title, description) => {
              // setNewList([{ content: title, description: description }]);
              addHandle(title, description);
            }}
          />

          <div className="taskListContainer">
            <div className="searchContainer taskContainer">
              <p className="taskTitle">Search list</p>
              <form onSubmit={onSubmit}>
                <label>List Title</label>
                <input type="text" />
                <div className="TaskButtonContainer">
                  <input className="todoButton" type="submit" value="Search" />
                  <input
                    className="clearButton todoButton"
                    type="submit"
                    value="Clear"
                  />
                </div>
              </form>
            </div>
            <div className="listContainer taskContainer">
              {taskData == false ? "No List  . . . . " : ""}
              {taskData.map((item) => {
                return (
                  <div key={item.id} className="taskContent">
                    <p>
                      {item.content.length > 40
                        ? item.content.slice(0, 40) + " . . ."
                        : item.content}
                    </p>
                    <ul>
                      <li
                        className="detailButton"
                        onClick={() => {
                          navigate(`/list-detail/${item.id}`);
                        }}
                      >
                        Detail
                      </li>
                      <li
                        onClick={() => {
                          checkButton(item.id, item.content);
                        }}
                      >
                        {item.completed ? (
                          <i className="fa-solid fa-rotate-left"></i>
                        ) : (
                          <i className="fa-regular fa-circle-check checkButton" />
                        )}
                      </li>

                      <li
                        onClick={() => {
                          // !isLoading&& ketika loading maka disable
                          deleteButton(item.id);
                        }}
                      >
                        <i className="fa-solid fa-trash deleteButton" />
                      </li>
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </>
    );
  } else {
    result = <LoadSpin />;
  }

  return result;
}
