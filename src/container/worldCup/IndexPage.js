import React, { Component } from 'react';
import PropTypes from 'prop-types';
// import frog from '@cfp/frog';
import "./index.scss";
import nebulas from 'nebulas';
import NebPay from '../../lib/nebpay';

import country from './conntriesFlag';
import { flag } from './conntriesFlag';
import match from './matchArray';

var Account = nebulas.Account,
  neb = new nebulas.Neb();
neb.setRequest(new nebulas.HttpRequest("https://mainnet.nebulas.io"));
var nebPay = new NebPay();
var serialNumber;
var intervalQuery;
var dappAddress = "n1zFEMTvKd44aJAy1xxH2myT6bD5T3G4Sc2";
// bb4957bc2435689e50a75aff287525eee30dbd653225f8316626e74d59b6be6c
export default class IndexPage extends Component {
  static displayName = 'worldCup';
  static propTypes = {

  }
  constructor(props) {
    super(props);

    this.state = {
      author:'',
      selectName: '',
      selectMatchNum: 0,
      selectMatch: '',
      content: '',
      record: [],
    };
  }
  _selectRender = () => {
    const names = country.map((item, index) => {
      return <option className="option" key={index}>{item}</option>;
    });
    const matchs = match.map((item, index) => {
      return <option className="option" key={index}>{item.name}</option>;
    })
    return (
      <div className="selectDiv">
        <span className="country">国家</span>
        <select className="select" value={this.state.selectName} onChange={(item) => {
          this.setState({
            selectName: item.target.value,
            selectMatch: "",
            selectMatchNum: 0
          })
          this._getRecord(item.target.value);
        }}>
          {names}
        </select>
        <span className="country">比赛</span>
        <select value={this.state.selectMatch} onChange={(e) => {
          match.map((item, index) => {
            if (item.name === e.target.value) {
              if (item.num) {
                this.setState({
                  selectMatch: item.name,
                  selectMatchNum: item.num,
                  selectName: "",
                })
                this._getRecord("", item.num);
              }
            }
          })
        }}>
          {matchs}
        </select>
      </div>
    );
  }



  _submit() {
    if (typeof(webExtensionWallet) === "undefined") {
      alert("Extension wallet is not installed, please install it first");
      return;
    }

    var to = dappAddress;
    var value = "0";
    var callFunction = "save";
    var callArgs
    if (this.state.selectName !== '') {
      callArgs = `["${this.state.selectName}",{"author":"${this.state.author}","content":"${this.state.content}"}]`;
    } else {
      callArgs = `["${this.state.selectMatchNum}",{"author":"${this.state.author}","content":"${this.state.content}"}]`;
    }

    console.log("response of push: " + callArgs)
    serialNumber = nebPay.call(to, value, callFunction, callArgs, {    //使用nebpay的call接口去调用合约,
      listener: (resp) => this.cbPush(resp)        //设置listener, 处理交易返回信息
    });

    intervalQuery = setInterval(() => {
      this.funcIntervalQuery();
    }, 5000);
  }

  funcIntervalQuery() {
    nebPay.queryPayInfo(serialNumber)   //search transaction result from server (result upload to server by app)
      .then((resp) => {
        console.log("tx result: " + resp)   //resp is a JSON string
        var respObject = JSON.parse(resp)
        if (respObject.code === 0) {
          if (this.state.selectName !== '') {
            this._getRecord(this.state.selectName);
          } else {

            this._getRecord("",this.state.num);
          }
          clearInterval(intervalQuery)
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }

  cbPush(resp) {
    console.log("response of push: " + JSON.stringify(resp))
  }


  _getRecord(name, num) {
    var from = Account.NewAccount().getAddressString();

    var value = "0";
    var nonce = "0"
    var gas_price = "1000000"
    var gas_limit = "200000"
    var callFunction = "get";
    var callArgs
    if (name !== '') {
      callArgs = `["${name}"]`;
    } else {
      callArgs = `["${num}"]`;
    }
    var contract = {
      "function": callFunction,
      "args": callArgs
    }
    console.log("response of push: " + callArgs)
    neb.api.call(from, dappAddress, value, nonce, gas_price, gas_limit, contract).then((resp) => {
      this.cbResult(resp)
    }).catch(function (err) {
      //cbSearch(err)
      console.log("error:" + err.message)
    })

  }

  cbResult(resp) {
    var result = resp.result    ////resp is an object, resp.result is a JSON string
    console.log("return of rpc call: " + JSON.stringify(result))

    if (result !== 'null') {
      //if result is not null, then it should be "return value" or "error message"
      try {
        result = JSON.parse(result)
      } catch (err) {
        //result is the error message
      }
      this.setState({
        record: result.value
      });
      this.forceUpdate();
    } else {
      this.setState({
        record: []
      });
    }
  }

  changeContent(e) {
    this.setState({
      content: e.target.value
    })
  }
  changeAuthor(e){
    this.setState({ 
      author: e.target.value
    })
  }
  _refresh(){
    if (this.state.selectName !== '') {
      this._getRecord(this.state.selectName);
    } else {

      this._getRecord("",this.state.num);
    }
  }
  render() {
    return (
      <div className={'mod mod-profitList ani'}>

        <div className="head" />
        <span className='subTitle'>世界杯评论区</span>
        {this._selectRender()}

        {((this.state.selectName !== '') || (this.state.selectMatch !== '')) &&
          <div className="content" >

            {this.state.selectName !== '' &&
              <div className="countryInfo">

                {flag[this.state.selectName] &&
                  <img border="1" className="cotuntryFlag" src={flag[this.state.selectName]} alt="" />
                }
                <span className='subTitle'>{this.state.selectName}</span>
              </div>
            }

            {this.state.selectMatch !== '' &&
              <div className="countryInfo">
                <span className='subTitle'>{this.state.selectMatch}</span>
              </div>
            }

            <div className="commitView">
              <div className="commit">
                {this.state.record && this.state.record.map((item, index) => {
                  return (
                    <div key={index}>
                      <span id="commitItem">{item.author}</span>
                      <span>:</span>
                      <span id="commitItem">{item.content}</span>
                    </div>)
                })}
              </div>
              <div className="add_banner">

                <input type="text" id="smallName" ref="myTextInput" placeholder="昵称" onChange={(e) => this.changeAuthor(e)} />

                <input type="text" id="add_value" ref="myTextInput" placeholder="输入你的留言" onChange={(e) => this.changeContent(e)} />
                <button id="push" onClick={() => this._submit()}>留言</button>
                <button id="push" onClick={() => this._refresh()}>刷新</button>
              </div>
            </div>

          </div>}
      </div>
    );
  }
};
