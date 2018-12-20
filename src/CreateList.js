import React, { Component } from 'react';
import firebase from './firebase.js';
import santaIcon from './images/santa-transparent.png';

export class CreateList extends Component {
    constructor(props) {
      super(props);
      this.state = {
        newName: '',
        listName: '',
        limit: '',
        newNames: [],
        createList: false,
        listCreated: false,
        lookUpList: false,
        lookUpError: false,
      }
      this.createList = this.createList.bind(this);
      this.saveName = this.saveName.bind(this);
      this.saveListName = this.saveListName.bind(this);
      this.saveLimit = this.saveLimit.bind(this);
      this.addName = this.addName.bind(this);
      this.newList = this.newList.bind(this);
      this.lookUpList = this.lookUpList.bind(this);
      this.lookUpSubmit = this.lookUpSubmit.bind(this);
    }
    createList() {
      this.props.restart(true);
      this.setState({
        newName: '',
        listName: '',
        limit: '',
        newNames: [],
        listExists: false,
        lookUpList: false,
        createList: true
      })
    }
    saveName(e) {
      this.setState({
        newName: e.target.value
      });
    }
    saveListName(e) {
      const ref = firebase.database().ref();
      let newListName = e.target.value;
      let existingLists = [];
      ref.on('value', snapshot => {
        snapshot.forEach(child => {
          if (newListName.toLowerCase() === child.key) {
            existingLists.push(child.key);
          }
        });
      });
      if (existingLists.length !== 0) {
        this.setState({
          listExists: true,
          listName: newListName
        });
      } else {
        this.setState({
          listExists: false,
          listName: newListName
        })
      }
    }
    saveLimit(e) {
      let limitVal = e.target.value;
      this.setState({
        limit: limitVal
      });
    }
    addName(e) {
      e.preventDefault();
      if (this.state.newName.length > 0 && this.state.listName.length > 0) {
        this.setState({
          newNames: this.state.newNames.concat(this.state.newName),
          newName: ''
        });
      } else {
        console.log('fields are not complete');
      }
    }
    newList(arr) {
      const ref = firebase.database().ref(this.state.listName.toLowerCase()).child("names");
      const limitRef = firebase.database().ref(this.state.listName.toLowerCase()).child("limit");
      arr.forEach(function(item) {
        ref.push({
          name: item,
        });
      });
      this.setState({
        createList: false,
        listCreated: true,
        newNames: []
      })
      // push up the limit unless THE LIMIT DOES NOT EXIST!
      if (this.state.limit.length > 0) { 
        limitRef.push({
          limit: this.state.limit
        });
      }
      this.props.handlerFromParent(this.state.listName.toLowerCase());
    }
    lookUpList() {
      this.setState({
        newName: '',
        listName: '',
        limit: '',
        newNames: [],
        createList: false,
        lookUpList: true,
        lookUpError: false,
      })
      this.props.restart(true);
    }
    lookUpSubmit(e) {
      this.props.restart(true);
      e.preventDefault();
      if (this.state.listName.length > 0) {
        this.setState({
          listName: '',
          lookUpError: false,
        })
        this.props.handlerFromParent(this.state.listName.toLowerCase());
      } else {
        console.log('you must enter a list name!');
        this.setState({
          lookUpError: true,
        })
      }
    }
    render() {
      return (
        <div className="front">  
          <button onClick={() => this.createList()}>Create a Santa List</button>
          <button onClick={() => this.lookUpList()}>Find a Santa List</button>
  
          {this.state.lookUpList ?
            <div className="lookUpForm">
              <form onSubmit={this.lookUpSubmit} className="list-lookup">
                <input type="text" placeholder="List Name" value={this.state.listName} onChange={this.saveListName} />
                <button type="submit">Find</button>
              </form>
              {this.state.lookUpError ? 
                <p>You must enter a list name!</p>
              : null}
            </div>
          : null}
  
          {this.state.createList ?
  
            <div className="newList">
  
              <form onSubmit={this.addName} className="create-list">
                <input type="text" placeholder="List Name" value={this.state.listName} onChange={this.saveListName} />
                <input type="text" placeholder="Name" value={this.state.newName} onChange={this.saveName} />
                {!this.state.listExists ?
                  <button type="submit">Add</button>
                : null}
              </form>              
  
              {this.state.listName.length > 0 ?
                <h2>List name: {this.state.listName}</h2>
              : null}
              
              {this.state.listExists ?
                <p>This list name is already in use :(.</p>
              : null}

              <ul className="new-list-names">
                {this.state.newNames.map((name, index) => (
                  <li key={index}><img src={santaIcon} alt={name} />{name}</li>
                ))}
              </ul>

              {this.state.newNames.length >= 3 && this.state.listName.length > 0 ?
                <div>
                  <input type="text" placeholder="Limit" value={this.state.limit} onChange={this.saveLimit} />
                  <button onClick={() => this.newList(this.state.newNames)}>Create</button>
                </div>
              : <p>A list name and at least three names are required for Secret Santa.</p>}
  
            </div>
          : null}

        </div>
      );
    }
  }

  export default CreateList;