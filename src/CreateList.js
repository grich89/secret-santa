import React, { Component } from 'react';
import firebase from './firebase.js';
import santaIcon from './images/santa-transparent.png';

export class CreateList extends Component {
    constructor(props) {
      super(props);
      this.state = {
        newName: '',
        listName: '',
        newNames: [],
        createList: false,
        listCreated: false,
        lookUpList: false
      }
      this.createList = this.createList.bind(this);
      this.saveName = this.saveName.bind(this);
      this.saveListName = this.saveListName.bind(this);
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
        newNames: [],
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
      this.setState({
        listName: e.target.value
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
      const ref = firebase.database().ref(this.state.listName).child("names");
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
      this.props.handlerFromParent(this.state.listName);
    }
    lookUpList() {
      this.setState({
        newName: '',
        listName: '',
        newNames: [],
        createList: false,
        lookUpList: true
      })
      this.props.restart(true);
    }
    lookUpSubmit(e) {
      e.preventDefault();
      if (this.state.listName.length > 0) {
        this.setState({
          listName: '',
        })
        this.props.handlerFromParent(this.state.listName);
      } else {
        console.log('you must enter a list name!');
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
            </div>
          : null}
  
          {this.state.createList ?
  
            <div className="newList">
  
              <form onSubmit={this.addName} className="create-list">
                <input type="text" placeholder="List Name" value={this.state.listName} onChange={this.saveListName} />
                <input type="text" placeholder="Name" value={this.state.newName} onChange={this.saveName} />
                <button type="submit">Add</button>
              </form>
  
              {this.state.listName.length > 0 ?
                <h2>List name: {this.state.listName}</h2>
              : null}
              <ul className="new-list-names">
                {this.state.newNames.map((name, index) => (
                  <li key={index}><img src={santaIcon} alt={name} />{name}</li>
                ))}
              </ul>
  
              {this.state.newNames.length >= 3 && this.state.listName.length > 0 ?
                <button onClick={() => this.newList(this.state.newNames)}>Create</button>
              : <p>A list name and at least three names are required for Secret Santa.</p>}
  
            </div>
          : null}
        </div>
      );
    }
  }

  export default CreateList;