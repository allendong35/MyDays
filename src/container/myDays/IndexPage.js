import React, { Component } from 'react';
import PropTypes from 'prop-types';
import "./index.scss";
import nebulas from 'nebulas';
import NebPay from 'lib/nebpay';
import { DatePicker } from 'antd';
import moment from 'moment';
import 'antd/dist/antd.css';
import 'moment/locale/zh-cn';
moment.locale('zh-cn');
var Account = nebulas.Account,
  neb = new nebulas.Neb();
neb.setRequest(new nebulas.HttpRequest("https://mainnet.nebulas.io"));
// neb.setRequest(new nebulas.HttpRequest("https://testnet.nebulas.io"));
//
var nebPay = new NebPay();
var serialNumber;
var intervalQuery = null;
// var dappAddress = "n1hJcYVKqJBwo7NqJ8HKgxfmxe12nZAoCjk";
var dappAddress = "n1yVAJhvCAaTfM928RXpaXVuj22KmG6KoBd";
// 2ccd0d47ef6023b2e2056125863acea8a68c4fcac158799a78ba8dc4501c0fd8
export default class IndexPage extends Component {
  static displayName = 'MyDays';
  static propTypes = {

  }
  constructor(props) {
    super(props);

    this.state = {
      address: '',
      content: '',
      date: '',
      records: [],
    };
  }

  _submit = (date) => {

    if (!date) {
      if (this.state.date === '' || this.state.content === '') {
        alert("请输入内容或选择时间");
        return;
      }
    }
    if (typeof (webExtensionWallet) === "undefined") {
      alert("Extension wallet is not installed, please install it first");
      return;
    }

    var to = dappAddress;
    var value = "0";
    var callFunction;
    var callArgs;
    if (date) {
      callFunction = "del";
      callArgs = `["${date.date}","${date.content}"]`;
    } else {
      callFunction = "save";
      callArgs = `[{"date":"${this.state.date}","content":"${this.state.content}"}]`;
    }


    console.log("_submit: " + callArgs)
    serialNumber = nebPay.call(to, value, callFunction, callArgs, {    //使用nebpay的call接口去调用合约,
      listener: (resp) => this.cbPush(resp)        //设置listener, 处理交易返回信息
    });
  }

  funcIntervalQuery() {
    // nebPay.queryPayInfo(serialNumber)   //search transaction result from server (result upload to server by app)
    //   .then((resp) => {
    //     console.log("tx result: " + resp)   //resp is a JSON string
    //     var respObject = JSON.parse(resp)
    // if (respObject.code === 0) {

    this._getRealRecord(this.state.address);

    //   clearInterval(intervalQuery)
    // }
    // })
    // .catch((err) => {
    //   console.log(err);
    // });
  }

  cbPush(resp) {
    console.log("response of push: " + JSON.stringify(resp))
  }



  _getRealRecord = (form) => {
    if (form === '') {
      alert('请输入正确的钱包地址');
      return;
    }
    var value = "0";
    var nonce = "0"
    var gas_price = "1000000"
    var gas_limit = "200000"
    var callFunction = "get";
    var callArgs = `["${form}"]`;

    var contract = {
      "function": callFunction,
      "args": callArgs
    }
    console.log("_getRealRecord: " + callArgs)
    neb.api.call(form, dappAddress, value, nonce, gas_price, gas_limit, contract).then((resp) => {
      this.cbResult(resp)
    }).catch(function (err) {
      //cbSearch(err)
      console.log("error:" + err.message)
      alert('输入钱包地址有误');
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
        return;
        //result is the error message
      }
      this.setState({
        address: result.form,
      })
      if (result.item) {
      if (result.item.value.length > this.state.records.length) {
       if (intervalQuery !== null) {
        alert('添加成功');
       }
      } else if (result.item.value.length < this.state.records.length) {
        alert('删除成功');
      } else {
        if (intervalQuery !== null) {
        return;
        }
      }
      this.setState({
        records: result.item.value,
      });
    }
      if (intervalQuery === null) {
        alert('成功获得记事本内容'); 
        intervalQuery = setInterval(() => {
          this.funcIntervalQuery();
        }, 1000);
      }
      this.forceUpdate();
    } else {
      this.setState({
        records: [],
      });
    }
   
  }

  _changeContent(e) {
    this.setState({
      content: e.target.value
    })
  }
  render() {
    return (
      <div className={'mod-profitList'}>
        {this.state.address !== '' &&
          <div className='content'>
            <span className='title'>记事本 </span>
            <div className="commit">
              {this.state.records.length > 0 && this.state.records.map((item, index) => {
                return (
                  <div className="itemContent" key={index}>
                    <div>
                      <span id="commitItem">{item.date}</span>
                      <span id="commitItem">:</span>
                      <span id="commitItem">{item.content}</span>
                    </div>
                    <button className="delBtn" onClick={this._submit.bind(null, item)}>删除</button>
                  </div>
                );
              })}
              {this.state.records.length === 0 && <span id="commitItem">去添加日记或者点击获取</span>}
            </div>
            <div className='aaaa'>
              <input type="text" id="add_value" ref="myTextInput11" className='address' value={this.state.address} placeholder="输入钱包地址" />
              <button className={"addBtn a"} onClick={() => {
                clearInterval(intervalQuery);
                intervalQuery=null;
                this._getRealRecord(this.refs.myTextInput11.value);
              }
              }>获得记事本内容</button>
            </div>
            <div className='line' />
            <div className='addNew'>
              <span className='newAction'>新增事件</span>
              <div className='time'>
                <span className='newAction'>时间</span>
                <DatePicker className={'date'} defaultValue={moment('2018-01-01', 'YYYY-MM-DD')} size='large' onChange={(date, dateString) => {
                  this.setState({
                    date: dateString
                  })
                }}>
                </DatePicker>
              </div>

              <div className='action'>
                <span className='newAction'>事件</span>
                <input type="text" id="add_value" placeholder="输入事件" onChange={(e) => this._changeContent(e)} />
              </div>
              <button className="addBtn" onClick={() => this._submit()}>添加</button>
            </div>
          </div>}


        {this.state.address === '' &&

          <div className='content'>
            <div className='bbbb'>
              <input type="text" id="add_value" className='address' ref="myTextInput" placeholder="输入钱包地址" />
              <button className={"addBtn a"} onClick={() => {

                this._getRealRecord(this.refs.myTextInput.value);
              }
              }>进入记事本</button>
            </div>
          </div>
        }


      </div>
    );
  }
};
