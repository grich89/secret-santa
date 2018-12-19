import React, { Component } from 'react';
import { instanceOf } from 'prop-types';
import { withCookies, Cookies } from 'react-cookie';
import firebase from './firebase.js';
import santaIcon from './images/santa-transparent.png';
import CreateList from './CreateList.js';
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
      noListError: false,
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
    // sets the list name for the coming methods
    let listName = val;
    this.setState({
      selectedList: listName,
    }, this.addListValues);
  }

  addListValues() {
    // get the full list of names from firebase
    console.log(this.state.selectedList);
    const ref = firebase.database().ref(this.state.selectedList).child('names');
    let namesList = [];
    ref.on('value', snapshot => {
      if (snapshot.val() === null) {
        console.log('this is null');
        this.setState({
          noListError: true,
        })
      } else {
        snapshot.forEach(child => {
          let item = child.val().name;
          console.log(item);
          namesList.push(item);
        });
      }
      this.setState({
        namesLoaded: true,
        noListError: false,
        names: namesList
      });      
    });
    
    // get the list of already picked names from firebase
    const pickedRef = firebase.database().ref(this.state.selectedList).child("picked");
    let pickedNames = [];
    pickedRef.on('value', snapshot => {
      snapshot.forEach(child => {
       var picked = child.val().picked;
       pickedNames.push(picked);
      });
      this.setState({
        pickedNames: pickedNames,
      });
    });
  }

  yourName(name) {
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

    // remove the person's own name from the list on click
    let filteredNames = this.state.names.filter(function(name) {
      return name !== yourName;
    });

    console.log(filteredNames);

    // find names that haven't been picked
    filteredNames = this.state.names.filter(function(name) {
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
        yourName: '',
        setActive: false,
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

          {this.state.noListError ?
            <p>No list was found with that name :(.</p>  
          : null}

          {this.state.namesLoaded && !this.state.everyonePicked ?

          <div className="appContent">

            <div className="names-container">
            <p>Click on your own name to remove it from your Secret Santa list.</p>
              {console.log(this.state.names)}
              <ul id="names">
                {this.state.names.map((name, index) => (
                  <li 
                   key={index} 
                   onClick={() => this.yourName({name})}
                   className={this.state.yourName.name === name ? 'active': 'inactive'}
                   ><img src={santaIcon} alt={name} />{name}</li>
                ))}
              </ul>
            </div>

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

export default withCookies(App);
