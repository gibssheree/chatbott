import React, { Component } from "react";

class Header extends Component {
  render() {
    return (
      <div className="sticky-header">
        <div className="card-header">
          <p>Hermes AI</p>
          <div className="header-nav">
            <a href="#about">About</a>
            <a href="#contact">Contact</a>
          </div>
        </div>
      </div>
    );
  }
}

export default Header;
