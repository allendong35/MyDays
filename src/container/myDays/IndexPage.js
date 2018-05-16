import React, { Component } from 'react';
import PropTypes from 'prop-types';
// import frog from '@cfp/frog';
import "./index.scss";
import nebulas from 'nebulas';
import NebPay from 'lib/nebpay';
import Datetime from 'react-datetime';

var Account = nebulas.Account,
  neb = new nebulas.Neb();
// neb.setRequest(new nebulas.HttpRequest("https://mainnet.nebulas.io"));
neb.setRequest(new nebulas.HttpRequest("https://testnet.nebulas.io"));
//
var nebPay = new NebPay();
var serialNumber;
var intervalQuery;
var dappAddress = "n1zFEMTvKd44aJAy1xxH2myT6bD5T3G4Sc2";
// bb4957bc2435689e50a75aff287525eee30dbd653225f8316626e74d59b6be6c
export default class IndexPage extends Component {
  static displayName = 'MyDays';
  static propTypes = {

  }
  constructor(props) {
    super(props);

    this.state = {
      author: '',
      selectName: '',
      selectMatchNum: 0,
      selectMatch: '',
      content: '',
      record: [],
    };
  }

  _submit() {
    if (typeof (webExtensionWallet) === "undefined") {
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

            this._getRecord("", this.state.num);
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
  changeAuthor(e) {
    this.setState({
      author: e.target.value
    })
  }
  _refresh() {
    if (this.state.selectName !== '') {
      this._getRecord(this.state.selectName);
    } else {

      this._getRecord("", this.state.num);
    }
  }
  render() {
    return (
      <div className={'mod mod-profitList ani'}>
        <Datetime />
      </div>
    );
  }
};
