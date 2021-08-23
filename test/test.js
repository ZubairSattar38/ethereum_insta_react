const Decentragram = artifacts.require('./Decentragram.sol')

require('chai')
  .use(require('chai-as-promised'))
  .should()

contract('Decentragram', ([deployer, author, tipper]) => {
  let decentragram

  before(async () => {
    decentragram = await Decentragram.deployed()
  })

  describe('deployment', async () => {
    it('deploys successfully', async () => {
      const address = await decentragram.address
      assert.notEqual(address, 0x0)
      assert.notEqual(address, '')
      assert.notEqual(address, null)
      assert.notEqual(address, undefined)
    })

    it('has a name', async () => {
      const name = await decentragram.name()
      assert.equal(name, 'Decentragram')
    })
  })

  describe('images',async()=>{
    let result,imageCount
    const hash = 'abc123'
    before(async ()=>{
      result = await decentragram.uploadImage(hash,'Image description',{from: author})
      imageCount = await decentragram.imageCount()
    })
    it('create images',async ()=>{
        // SUCCESS
        assert.equal(imageCount,1)
        const event = result.logs[0].args
        assert.equal(event.id.toNumber(),imageCount.toNumber(),'Id Is Correct')
        assert.equal(event.hash,hash,'Hash Is Correct')
        assert.equal(event.description,'Image Description','Description Is Correct')
        assert.equal(event.tip.amount,'0','tip Amount is correct')
        assert.equal(event.author,author,'Author is Correct')
        console.log(result.logs[0].args)


        //   Failutes Images Must Have Hash 
        await decentragram.uploadImage('','Image description',{from: author}).should.be.rejected
        await decentragram.uploadImage(hash,'',{from: author}).should.be.rejected

    })

    //   Check from Struct
    it('list images', async()=>{
      const image =  await decentragram.images(imageCount)
      assert.equal(image.id.toNumber(),imageCount.toNumber(),'Id Is Correct')
      assert.equal(image.hash,hash,'Hash Is Correct')
      assert.equal(image.description,'Image Description','Description Is Correct')
      assert.equal(image.tip.amount,'0','tip Amount is correct')
      assert.equal(image.author,author,'Author is Correct')
    })

    it('allow users to tip images',async()=>{
      //  Track the author balance before purchase 
      let oldAuthorBalance
      oldAuthorBalance = await web3.eth.getBalance(author)
      oldAuthorBalance = new web3.utils.BN(oldAuthorBalance)

      result =  await decentragram.tipImageOwner(imageCount,{from: tipper,value: web3.utils.toWei('1','Ether')})

      //  Success
      const event = result.logs[0].args;
      assert.equal(event.id.toNumber(),imageCount.toNumber(),'Id Is Correct')
      assert.equal(event.hash,hash,'Hash Is Correct')
      assert.equal(event.description,'Image Description','Description Is Correct')
      assert.equal(event.tip.amount,'0','tip Amount is correct')
      assert.equal(event.author,author,'Author is Correct')


      //  Check The author received Funds 
      let newAuthorBalance;
      newAuthorBalance = await web3.eth.getBalance(author)
      newAuthorBalance = await web3.utils.BN(newAuthorBalance)

      let tipImageOwner
      tipImageOwner =  web3.utils.toWei('1','Ether')
      tipImageOwner = new web3.utils.BN(tipImageOwner)

      const expectedBalance = oldAuthorBalance.add(tipImageOwner)

      assert.equal(newAuthorBalance.toString(),expectedBalance.toString())


      // FAILURE: tries to tip a image that does not exist
      await decentragram.tipImageOwner(99,{from: tipper,value:web3.utils.toWei('1','Ether')})
    })
  })
})