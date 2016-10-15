pragma solidity >= 0.3 .0;

contract token {
    function transfer(address reciever, uint amount) {}
}

contract Sale {
    address public beneficiary;
    uint public fundingGoal;
    uint public amountFunded;
    uint public deadline;
    uint public price;
    token public share;
    mapping(address => uint256) public balanceOf;
    bool fundingGoalReached = false;
    event GoalReached(address beneficiary, uint amountFunded);
    event FundTransfer(address backer, uint amount, bool isContribution);
    bool saleClosed = false;

    function Sale(
        address successAddress,
        uint goal,
        uint duration,
        uint cost,
        token tokenAddress
    ) {
        beneficiary = successAddress;
        fundingGoal = goal * 1 ether;
        deadline = now + duration * 1 minutes;
        price = cost * 1 ether;
        share = token(tokenAddress);
    }

    function() {
        if (saleClosed) throw;
        uint amount = msg.value;
        balanceOf[msg.sender] = amount;
        amountFunded += amount;
        share.transfer(msg.sender, amount / price);
        FundTransfer(msg.sender, amount, true);
    }

    modifier afterDeadline() {
        if (now >= deadline) _;
    }

    function checkGoalReached() afterDeadline {
        if (amountFunded >= fundingGoal) {
            fundingGoalReached = true;
            GoalReached(beneficiary, amountFunded);
        }
        saleClosed = true;
    }

    function safeWithdrawal() afterDeadline {
        if (!fundingGoalReached) {
            uint amount = balanceOf[msg.sender];
            balanceOf[msg.sender] = 0;
            if (amount > 0) {
                if (msg.sender.send(amount)) {
                    FundTransfer(msg.sender, amount, false);
                } else {
                    balanceOf[msg.sender] = amount;
                }
            }
        }

        if (fundingGoalReached && beneficiary == msg.sender) {
            if (beneficiary.send(amountFunded)) {
                FundTransfer(beneficiary, amountFunded, false);
            } else {
                fundingGoalReached = false;
            }
        }
    }
}
