const list = [
  '阿凡达',
  '肖申克的救赎',
];

const results = [];

const searchMovie = (name) => new Promise((resolve) => {
  let maxTimes = 3;
  const search = (ck) => {
    const searchUrl = `https://movie.douban.com/subject_search?search_text=${encodeURIComponent(name)}&cat=1002`;
    $.get(searchUrl, (data) => {
      setTimeout(() => {
        if (ck) ck();
      }, 1000);
      $(document.body).html(data);
    });
  };

  const check = () => {
    if ($('#root').find('.sc-ifAKCX').length) {
      resolve();
    } else {
      if (maxTimes) {
        maxTimes --;
        setTimeout(check, 1000);
      } else {
        search(check);
      }
    }
  };

  search(check);
});

const getMovieUrl = () => new Promise((resolve, reject) => {
  const getUrl = () => {
    const dom = $('#root').find('.sc-ifAKCX').eq(0).find('a').eq(0);
    if (dom) {
      resolve(dom.attr('href'));
    } else {
      setTimeout(getUrl, 500);
    }
  };
  getUrl();
});

const getMoviePage = (movieUrl) => new Promise((resolve, reject) => {
  let maxTimes = 3;
  const getPage = (ck) => {
    $.get(movieUrl, (data) => {
      setTimeout(() => {
        if (ck) ck();
      }, 1000);
      $(document.body).html(data);
    });
  };

  const check = () => {
    if ($('#content').find('h1').length) {
      resolve();
    } else {
      if (maxTimes) {
        maxTimes --;
        setTimeout(check, 1000);
      } else {
        getPage(check);
      }
    }
  };

  getPage(check);
});

const getMovieData = () => new Promise((resolve, reject) => {
  const getData = () => {
    const content = $('#content');
    const nameAndYear = content.children('h1').text().trim().replace(/\n/g, '').match(/(^.*)\((\d*)\)/);
    const name = nameAndYear[1].trim();
    const year = nameAndYear[2].trim();
    const infoDom = $('#info');
    let region = '';
    let director = '';
    let imdb = '';
    infoDom.find('span.pl').each((i, v) => {
      const title = $(v).text().replace(/[\n|\s]/g, '');
      const nextDom = $(v).next();
      if (title.indexOf('制片国家') >= 0) {
        region = v.nextSibling.nodeValue.trim();
      }
      if (title.indexOf('导演') >= 0) {
        director = nextDom.children('a').text().trim();
      }
      if (title.indexOf('IMDb链接') >= 0) {
        imdb = nextDom.attr('href').trim();
      }
    });
    let score = $('#interest_sectl').find('strong.rating_num').text().trim();
    const obj = { name, year, region, director, score, imdb };
    return obj;
  };

  const o = getData();
  setTimeout(() => {
    resolve(o);
    results.push(o);
    window.localSorage.setItem('wangxiao-data', results);
  }, 1000);
});

const main = () => {
  let index = 0;
  const spider = (name) => {
    return searchMovie(name).then(() => {
      return getMovieUrl();
    }).then((url) => {
      return getMoviePage(url);
    }).then(() => {
      return getMovieData();
    }).then((data) => {
      console.log(data);
      if (index < list.length - 1) {
        index ++;
        spider(list[index]);
      } else {
        console.error('蔡蔚，下面是你要的数据，直接复制：');
        console.error('----------------------------------');
        console.log(JSON.stringify(results));
        console.error('----------------------------------');
      }
    });
  };

  spider(list[index]);
};





