class PeerService {
  constructor() {
    if (!this.peer) {
      this.peer = new RTCPeerConnection({
        iceServers: [
          { urls: "stun:global.stun.twilio.com:3478" },
          {
            urls: "turn:global.turn.twilio.com:3478",
            username: "your_username",
            credential: "your_credential"
          }
        ]
      });
      
    }
  }

  async getAnswer(offer) {
    if (this.peer) {

      await this.peer.setRemoteDescription(offer);
      const ans = await this.peer.createAnswer();
      await this.peer.setLocalDescription(new RTCSessionDescription(ans));
      return ans;
    }
  }

  async setRemoteDescription(ans) {
    if (this.peer) {
      await this.peer.setRemoteDescription(new RTCSessionDescription(ans));
    }
  }

  async getOffer() {
    if (this.peer) {
      const offer = await this.peer.createOffer();
      await this.peer.setLocalDescription(new RTCSessionDescription(offer));
      return offer;
    }
  }
}

export default new PeerService();
