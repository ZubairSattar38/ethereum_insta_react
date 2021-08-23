import React, { Component } from 'react';
import Web3 from 'web3';
import Identicon from 'identicon.js';
import './App.css';
import Decentragram from '../abis/Decentragram.json'
import Navbar from './Navbar'
import Main from './Main'

const ipfsClient = require('ipfs-http-client')
const ipfs = ipfsClient({host:'ipfs.infura.io',port:5001,protocol:'https'})

class App extends Component {

  async componentWillMount() {
    await this.loadWeb3()
    await this.loadBlockchainData()
  } 
  async loadWeb3(){

    //      connect client side to metamask
    if(window.ethereum){
      window.web3 = new Web3(window.ethereum);
      await window.ethereum.enable();
    }
    else if(window.web3){
      window.web3 = new Web3(window.web3.currentProvider)
    }else{
      window.alert("Non-Ethereum Browser Detected.You Should Consider Tryng Metamask!")
    }
  }
  captureFile = event =>{

    //   its get the file from the computer
    event.preventDefault();    // when we submit the button it prevents to refresh the page
    const file = event.target.files[0];
    const reader  = new window.FileReader()
    reader.readAsArrayBuffer(file);


    // it converts the file into ipfs
    reader.onloadend=()=>{
      this.setState({buffer:Buffer(reader.result)})
      console.log('Buffer ',this.state.buffer)
    }
  }

  uploadImage =  description =>{
    console.log('Submitting file to ipfs ...')
     //  Adding file to IPFS
     ipfs.add(this.state.buffer,(error,result)=>{
       console.log("IPFS Result  ",result);
       if(error){
         console.log(result);
         return;
       }
       //   If u check picture that we are uploaded on IPFS then
       //  https://ipfs.infura.io/ipfs/  hashValue

       this.setState({loading:true})
       this.state.decentragram.methods.uploadImage(result[0].hash,description).send({from:this.state.account}).on('transactionHash',(hash)=>{
         this.setState({loading:false})
       })
     })
  }
  async loadBlockchainData(){
    const web3 = window.web3;
    //  load Account
    const accounts = await web3.eth.getAccounts()
    console.log("Accounts ",accounts[0]);
    this.setState({
      account:accounts[0]
    })

    //    Get Network Id 
    const networkId = await web3.eth.net.getId();
    const networkData = Decentragram.networks[networkId];
    if(networkData){
          //    Connected to the Smart Contract

      const decentragram = web3.eth.Contract(Decentragram.abi,networkData.address);
      this.setState({decentragram:decentragram})

      const imagesCount = await decentragram.methods.imageCount().call();
      this.setState({imagesCount})

            //          Load up the all images

        for(var i=1;i<imagesCount;i++){
          const image = await decentragram.methods.images(i).call()
          this.setState({
            images:[...this.state.images,image]
          })
        }

        //    Sort Images. Show higest tipped images first
        this.setState({
          images: this.state.images.sort((a,b)=>b.tipAmount-a.tipAmount)
        })
      this.setState({loading:false})
    }else{
      window.alert('Decentragram Contract not deployed to Detected Network')
    }
  }

  tipImageOwner = (id,tipAmount)=>{
    this.setState({loading:true})
    this.state.decentragram.methods.tipImageOwner(id).send({from:this.state.account,value:tipAmount}).on('transactionHash',(hash)=>{
      this.setState({loading:false})
  })
}
  constructor(props) {
    super(props)
    this.state = {
      account: '',
      decentragram:null,   // to store the contract
       images:[],
       loading:true,
       imagesCount:0
    }
  }

  render() {
    return (
      <div>
        <Navbar account={this.state.account} />
        { this.state.loading
          ? <div id="loader" className="text-center mt-5"><p>Loading...</p></div>
          : <Main
              images={this.state.images}
              captureFile = {this.captureFile}
              uploadImage = {this.uploadImage}
              tipImageOwner = {this.tipImageOwner}
            />
          }
      </div>
    );
  }
}

export default App;