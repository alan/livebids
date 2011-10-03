li ->
  span -> @data.msg
  img class: 'avatar', src: @data.img_src
  if @data.service
    img class: 'service', src: @data.service

