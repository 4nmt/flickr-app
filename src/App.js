import React, { Component } from "react";
import axios from "axios";
import JLayout from "justified-layout";
import InfiniteScroll from "react-infinite-scroller";
import "./App.css";

class Image extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isHover: false
    };
  }
  hover() {
    this.setState({
      isHover: !this.state.isHover
    });
  }

  unHover() {
    this.setState({
      isHover: !this.state.isHover
    });
  }
  render() {
    let style = {
      left: this.props.box.left,
      top: this.props.box.top,
      width: this.props.box.width,
      height: this.props.box.height,
      backgroundImage: "url(" + this.props.album.data.source + ")"
    };

    let info = this.state.isHover ? "block" : "none";

    return (
      <div
        className="box"
        style={style}
        onMouseEnter={() => this.hover()}
        onMouseLeave={() => this.unHover()}
      >
        <div className="link" />

        <div className="interaction-bar" style={{ display: `${info}` }}>
          <div className="text">
            <a className="title">{this.props.album.title}</a>
            <a className="attribution">by {this.props.album.ownername}</a>
            <p className="attribution">views: {this.props.album.views}</p>
          </div>
        </div>
      </div>
    );
  }
}

class Gallery extends Component {
  renderImage(i) {
    return (
      <Image
        key={i}
        box={this.props.geometry.boxes[i]}
        album={this.props.album[i]}
      />
    );
  }

  render() {
    const geometry = this.props.geometry;
    let boxes = geometry.boxes.map((box, i) => {
      return this.renderImage(i);
    });

    return (
      <InfiniteScroll
        pageStart={0}
        hasMore={true || false}
        loadMore={page => this.props.loadFunc(page)}
        loader={
          <div className="loader" key={0}>
            Loading ...
          </div>
        }
      >
        <div
          className="wrapper"
          style={{
            height: geometry.containerHeight + "px",
            width: geometry.containerHeight + "px"
          }}
        >
          {boxes}
        </div>
      </InfiniteScroll>
    );
  }
}

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      album: []
    };
  }

  async loadFunc(page) {
    let photos = [];

    await axios
      .get(`https://api.flickr.com/services/rest/`, {
        params: {
          api_key: "19348203ef2fded44fd56dbcc87aca93",
          method: "flickr.interestingness.getList",
          format: "json",
          nojsoncallback: 1,
          per_page: 25,
          page: page,
          extras: "owner_name,views"
        }
      })
      .then(res => {
        photos = [...res.data.photos.photo];
      });

    let album = this.state.album.slice();

    for (let i = 0; i < 20; i++) {
      axios
        .get(`https://api.flickr.com/services/rest/`, {
          params: {
            api_key: "19348203ef2fded44fd56dbcc87aca93",
            method: "flickr.photos.getSizes",
            format: "json",
            photo_id: photos[i].id,
            nojsoncallback: 1
          }
        })
        .then(res => {
          album.push({
            data: res.data.sizes.size[5],
            title: photos[i].title,
            ownername: photos[i].ownername,
            views: photos[i].views
          });

          this.setState({
            album: album
          });
        });
    }
  }
  render() {
    const album = this.state.album;
    const Geometries = album.map(val => {
      return {
        width: val.data.width * 0.8,
        height: val.data.height
      };
    });
    let width = window.innerWidth * 0.8 - 16; // padding
    const geometry = JLayout(Geometries, {
      containerWidth: width
    });

    return (
      <div className="App">
        <header className="App-header">
          <img
            src="https://cdn2.techadvisor.co.uk/cmsdata/features/3637023/flickr-thumb_thumb800.png"
            className="App-logo"
            alt="logo"
          />
        </header>
        <Gallery
          geometry={geometry}
          album={album}
          loadFunc={page => this.loadFunc(page)}
        />
      </div>
    );
  }
}

export default App;
