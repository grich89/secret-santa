import React, { Component } from 'react';
import { instanceOf } from 'prop-types';
import { withCookies, Cookies } from 'react-cookie';
import firebase from './firebase.js';
import santaIcon from './images/santa-transparent.png';
import './App.css';

class App extends Component {
  static propTypes = {
    cookies: instanceOf(Cookies).isRequired
  };
 
  constructor(props) {
    super(props);

    const { cookies } = props;

    this.state = {
      names: [],
      pickedNames: [],
      selectedName: '',
      selectedList: '',
      buttonClicked: false,
      namesLoaded: false,
      everyonePicked: false,
      yourName: '',
      setActive: false,
      santa: cookies.get("santa"),
      name: '',
    }
    this.setListValue = this.setListValue.bind(this);
    this.addListValues = this.addListValues.bind(this);
    this.yourName = this.yourName.bind(this);
    this.randomName = this.randomName.bind(this);
    this.resetSantas = this.resetSantas.bind(this);
  }

  setListValue(val) {
    this.setState({
      selectedList: this.state.selectedList = val,
    }, this.addListValues);
  }

  addListValues() {
    // get the full list of names from firebase
    const ref = firebase.database().ref(this.state.selectedList);
    ref.on('value', snapshot => {
      console.log(snapshot.child);
      snapshot.forEach(child => {
        console.log([child.val().name]);
        this.setState({
          namesLoaded: true,
          names: this.state.names.concat([child.val().name]),
        });
      });      
    });

    // get the list of already picked names from firebase
    const pickedRef = firebase.database().ref(this.state.selectedList).child("picked");
    pickedRef.on('value', snapshot => {
      snapshot.forEach(child => {
       var picked = child.val().picked;
       this.setState({
          pickedNames: this.state.pickedNames.concat(picked),
       });
      });
    });
  }

  yourName(name, e) {
    // sets the user's on click
    this.setState({
      setActive: true,
      yourName: name,
    })
  }

  randomName() {

    // load the cookies functionality 
    const { cookies } = this.props;

    // names that have already been picked
    let pickedArray = this.state.pickedNames;
    let yourName = this.state.yourName.name;

    console.log(this.state.names[0]);

    // remove the person's own name from the list on click
    let filteredNames = this.state.names[0].filter(function(name) {
      return name !== yourName;
    });

    console.log(filteredNames);

    // find names that haven't been picked
    filteredNames = this.state.names[0].filter(function(name) {
      return !pickedArray.includes(name);
    });
    
    if (filteredNames.length !== 0) {
      // randomly select a name from the filteredNames
      let selectedName = filteredNames[Math.floor(Math.random() * filteredNames.length)];

      // update the state
      this.setState({
        everyonePicked: false,
        buttonClicked: true,
        name: selectedName
      });

      // push the randomly selected name to the picked names list
      const ref = firebase.database().ref(this.state.selectedList).child("picked");
      const newRef = ref.push();
      newRef.set({
        picked: selectedName,
      });

      // set the santa cookie to the selectedName
      cookies.set('santa', selectedName, {path: '/' });
    } else {
      console.log('everyone has been picked');
      this.setState({
        everyonePicked: true
      })
    }
    
  }

  resetSantas(val) {
    if (val === true) {
      this.setState({
        names: [],
        pickedNames: [],
        selectedName: '',
        selectedList: '',
        buttonClicked: false,
        namesLoaded: false,
        everyonePicked: false,
        name: '',
      })
    }
  }
  
  render() {
    return (
      <div className="App"> 
        <header className="App-header">
          <CreateList 
            handlerFromParent={this.setListValue} 
            restart={this.resetSantas}
          />

          {this.state.namesLoaded && !this.state.everyonePicked ?

          <div className="appContent">

            {this.state.names[0] !== undefined ?
            <div className="names-container">
            <p>Click on your own name to remove it from the running.</p>
              <ul id="names">
                {this.state.names[0].map((name, index) => (
                  <li 
                   key={index} 
                   onClick={() => this.yourName({name})}
                   className={this.state.yourName.name === name ? 'active': 'inactive'}
                   ><img src={santaIcon} alt={name} />{name}</li>
                ))}
              </ul>
            </div>
            : <p>You have already viewed this list.</p>}

            {!this.state.buttonClicked ?

              <div className="fixed">
                <button onClick={() => this.randomName()}>Reveal Your Secret Santa</button>
              </div>

            : <div id="secret-santa">Your secret santa is: {this.state.name}</div>}

          </div>

          : null}

          {this.state.namesLoaded && this.state.everyonePicked ?
            <p>Everyone has been picked.</p>
          : null}
    
          {this.state.santa ? <p>You already have picked: {this.state.santa}</p> : null}

        </header>
      </div>
    );
  }
}

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
    this.setState({
      newName: '',
      listName: '',
      newNames: [],
      lookUpList: false,
      createList: true
    })
    this.props.restart(true);
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
    const ref = firebase.database().ref(this.state.listName);
    const newRef = ref.push();
    newRef.set({
      name: arr
    })
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
      this.props.restart(true);
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

            {this.state.newNames.length > 0 && this.state.listName.length > 0 ?
              <button onClick={() => this.newList(this.state.newNames)}>Create</button>
            : null}

          </div>
        : null}
      </div>
    );
  }
}

export default withCookies(App);
