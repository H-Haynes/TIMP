module.exports = {
    content: [
      './packages/renderer/*.{html,js}',
      './packages/renderer/**/*.vue',
    ],
    darkMode:'media',
    theme: {
      extend: {
        colors:{
          'primary-100':'#212121',
          'primary-500':'#171717',
          'primary-200':'#323940',
          'white-300':'#d5d5d5',
        },
        lineHeight:{
          '12':'3rem',
        },
        minWidth:{
          '1/2':'50%',
        },
        flex:{
          '1':'1',
          '2':'2',
          '3':'3',
          '4':'4',
          '5':'5',
          '6':'6',
          '7':'7',
        },
  
      },
  
    },
    plugins: [],
  };
  