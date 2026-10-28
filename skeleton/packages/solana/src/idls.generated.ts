// Frozen UTF-8 snapshots of the captured research IDLs. No runtime network loading.
export const pumpIdl: any = {
  "address": "6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P",
  "metadata": {
    "name": "pump",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "add_quote_control_mint",
      "discriminator": [
        2,
        14,
        61,
        138,
        170,
        142,
        14,
        95
      ],
      "accounts": [
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "global",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  108,
                  111,
                  98,
                  97,
                  108
                ]
              }
            ]
          }
        },
        {
          "name": "quote_control",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  113,
                  117,
                  111,
                  116,
                  101,
                  45,
                  99,
                  111,
                  110,
                  116,
                  114,
                  111,
                  108
                ]
              }
            ]
          }
        },
        {
          "name": "system_program",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "event_authority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  95,
                  95,
                  101,
                  118,
                  101,
                  110,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "program"
        }
      ],
      "args": [
        {
          "name": "quote_mint",
          "type": "pubkey"
        },
        {
          "name": "initial_virtual_quote_reserves",
          "type": "u64"
        }
      ]
    },
    {
      "name": "add_quote_mint",
      "discriminator": [
        111,
        121,
        21,
        56,
        40,
        24,
        94,
        209
      ],
      "accounts": [
        {
          "name": "global",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  108,
                  111,
                  98,
                  97,
                  108
                ]
              }
            ]
          }
        },
        {
          "name": "authority",
          "writable": true,
          "signer": true,
          "relations": [
            "global"
          ]
        },
        {
          "name": "event_authority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  95,
                  95,
                  101,
                  118,
                  101,
                  110,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "program"
        }
      ],
      "args": [
        {
          "name": "quote_mint",
          "type": "pubkey"
        }
      ]
    },
    {
      "name": "admin_cto",
      "discriminator": [
        125,
        126,
        214,
        134,
        77,
        229,
        188,
        89
      ],
      "accounts": [
        {
          "name": "admin_set_creator_authority",
          "writable": true,
          "signer": true,
          "relations": [
            "global"
          ]
        },
        {
          "name": "global",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  108,
                  111,
                  98,
                  97,
                  108
                ]
              }
            ]
          }
        },
        {
          "name": "mint"
        },
        {
          "name": "quote_mint"
        },
        {
          "name": "quote_token_program"
        },
        {
          "name": "associated_token_program",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "system_program",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "bonding_curve",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  111,
                  110,
                  100,
                  105,
                  110,
                  103,
                  45,
                  99,
                  117,
                  114,
                  118,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        },
        {
          "name": "current_creator",
          "docs": [
            "Not declared writable: a pre-creator (legacy) curve stores the zero key, which is the",
            "system program, whose write lock the runtime always demotes. Callers MUST still pass this",
            "account as writable whenever it is a wallet, so the outgoing creator can be paid from its",
            "vaults; otherwise the instruction fails with `CtoCreatorAccountNotWritable`. A creator that",
            "is not a system-owned wallet (a program, a sysvar, a pump-fees or other program-owned",
            "account) is skipped, its vault balances stay collectable, and it may be passed read-only."
          ]
        },
        {
          "name": "current_creator_quote_token_account",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "current_creator"
              },
              {
                "kind": "account",
                "path": "quote_token_program"
              },
              {
                "kind": "account",
                "path": "quote_mint"
              }
            ],
            "program": {
              "kind": "account",
              "path": "associated_token_program"
            }
          }
        },
        {
          "name": "creator_vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  114,
                  101,
                  97,
                  116,
                  111,
                  114,
                  45,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "current_creator"
              }
            ]
          }
        },
        {
          "name": "creator_vault_quote_token_account",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "creator_vault"
              },
              {
                "kind": "account",
                "path": "quote_token_program"
              },
              {
                "kind": "account",
                "path": "quote_mint"
              }
            ],
            "program": {
              "kind": "account",
              "path": "associated_token_program"
            }
          }
        },
        {
          "name": "holder_creator_vault",
          "docs": [
            "`[\"creator-vault\", find_program_address([\"holder-rewards\", mint], pump)]`. The sweep",
            "destination on the holder path of a fee-shared coin, ignored otherwise. Re-derived in the",
            "handler before it is written to; kept out of the seeds constraints to stay under the sBPF",
            "stack frame."
          ],
          "writable": true
        },
        {
          "name": "holder_creator_vault_quote_token_account",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "holder_creator_vault"
              },
              {
                "kind": "account",
                "path": "quote_token_program"
              },
              {
                "kind": "account",
                "path": "quote_mint"
              }
            ],
            "program": {
              "kind": "account",
              "path": "associated_token_program"
            }
          }
        },
        {
          "name": "pump_amm",
          "address": "pAMMBay6oceH9fJKBRHGP5D4bD4sWpmSwMn52FMfXEA"
        },
        {
          "name": "amm_global_config",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  108,
                  111,
                  98,
                  97,
                  108,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ],
            "program": {
              "kind": "account",
              "path": "pump_amm"
            }
          }
        },
        {
          "name": "pool_authority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  111,
                  111,
                  108,
                  45,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        },
        {
          "name": "pool",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  111,
                  111,
                  108
                ]
              },
              {
                "kind": "const",
                "value": [
                  0,
                  0
                ]
              },
              {
                "kind": "account",
                "path": "pool_authority"
              },
              {
                "kind": "account",
                "path": "mint"
              },
              {
                "kind": "account",
                "path": "quote_mint"
              }
            ],
            "program": {
              "kind": "account",
              "path": "pump_amm"
            }
          }
        },
        {
          "name": "pump_amm_event_authority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  95,
                  95,
                  101,
                  118,
                  101,
                  110,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              }
            ],
            "program": {
              "kind": "account",
              "path": "pump_amm"
            }
          }
        },
        {
          "name": "coin_creator_vault_authority",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  114,
                  101,
                  97,
                  116,
                  111,
                  114,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "current_creator"
              }
            ],
            "program": {
              "kind": "account",
              "path": "pump_amm"
            }
          }
        },
        {
          "name": "coin_creator_vault_ata",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "coin_creator_vault_authority"
              },
              {
                "kind": "account",
                "path": "quote_token_program"
              },
              {
                "kind": "account",
                "path": "quote_mint"
              }
            ],
            "program": {
              "kind": "account",
              "path": "associated_token_program"
            }
          }
        },
        {
          "name": "sharing_config",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  104,
                  97,
                  114,
                  105,
                  110,
                  103,
                  45,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ],
            "program": {
              "kind": "account",
              "path": "pump_fees"
            }
          }
        },
        {
          "name": "pump_fees",
          "address": "pfeeUxB6jkeY1Hxd7CsFCAjcbHA9rWtchMGdZ6VojVZ"
        },
        {
          "name": "pump_fees_event_authority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  95,
                  95,
                  101,
                  118,
                  101,
                  110,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              }
            ],
            "program": {
              "kind": "account",
              "path": "pump_fees"
            }
          }
        },
        {
          "name": "event_authority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  95,
                  95,
                  101,
                  118,
                  101,
                  110,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "program"
        }
      ],
      "args": [
        {
          "name": "is_holder_reward",
          "type": {
            "option": "bool"
          }
        },
        {
          "name": "creator_fee_bps",
          "type": {
            "option": "u64"
          }
        },
        {
          "name": "new_creator",
          "type": {
            "option": "pubkey"
          }
        }
      ]
    },
    {
      "name": "admin_set_idl_authority",
      "discriminator": [
        8,
        217,
        96,
        231,
        144,
        104,
        192,
        5
      ],
      "accounts": [
        {
          "name": "authority",
          "signer": true,
          "relations": [
            "global"
          ]
        },
        {
          "name": "global",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  108,
                  111,
                  98,
                  97,
                  108
                ]
              }
            ]
          }
        },
        {
          "name": "idl_account",
          "writable": true
        },
        {
          "name": "system_program",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "program_signer",
          "pda": {
            "seeds": []
          }
        },
        {
          "name": "event_authority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  95,
                  95,
                  101,
                  118,
                  101,
                  110,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "program"
        }
      ],
      "args": [
        {
          "name": "idl_authority",
          "type": "pubkey"
        }
      ]
    },
    {
      "name": "admin_update_token_incentives",
      "discriminator": [
        209,
        11,
        115,
        87,
        213,
        23,
        124,
        204
      ],
      "accounts": [
        {
          "name": "authority",
          "writable": true,
          "signer": true,
          "relations": [
            "global"
          ]
        },
        {
          "name": "global",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  108,
                  111,
                  98,
                  97,
                  108
                ]
              }
            ]
          }
        },
        {
          "name": "global_volume_accumulator",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  108,
                  111,
                  98,
                  97,
                  108,
                  95,
                  118,
                  111,
                  108,
                  117,
                  109,
                  101,
                  95,
                  97,
                  99,
                  99,
                  117,
                  109,
                  117,
                  108,
                  97,
                  116,
                  111,
                  114
                ]
              }
            ]
          }
        },
        {
          "name": "mint"
        },
        {
          "name": "global_incentive_token_account",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "global_volume_accumulator"
              },
              {
                "kind": "account",
                "path": "token_program"
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "associated_token_program",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "system_program",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "token_program"
        },
        {
          "name": "event_authority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  95,
                  95,
                  101,
                  118,
                  101,
                  110,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "program"
        }
      ],
      "args": [
        {
          "name": "start_time",
          "type": "i64"
        },
        {
          "name": "end_time",
          "type": "i64"
        },
        {
          "name": "seconds_in_a_day",
          "type": "i64"
        },
        {
          "name": "day_number",
          "type": "u64"
        },
        {
          "name": "pump_token_supply_per_day",
          "type": "u64"
        }
      ]
    },
    {
      "name": "buy",
      "docs": [
        "Buys tokens from a bonding curve."
      ],
      "discriminator": [
        102,
        6,
        61,
        18,
        1,
        218,
        235,
        234
      ],
      "accounts": [
        {
          "name": "global",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  108,
                  111,
                  98,
                  97,
                  108
                ]
              }
            ]
          }
        },
        {
          "name": "fee_recipient",
          "writable": true
        },
        {
          "name": "mint"
        },
        {
          "name": "bonding_curve",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  111,
                  110,
                  100,
                  105,
                  110,
                  103,
                  45,
                  99,
                  117,
                  114,
                  118,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        },
        {
          "name": "associated_bonding_curve",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "bonding_curve"
              },
              {
                "kind": "account",
                "path": "token_program"
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "associated_user",
          "writable": true
        },
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "system_program",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "token_program"
        },
        {
          "name": "creator_vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  114,
                  101,
                  97,
                  116,
                  111,
                  114,
                  45,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "bonding_curve.creator",
                "account": "BondingCurve"
              }
            ]
          }
        },
        {
          "name": "event_authority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  95,
                  95,
                  101,
                  118,
                  101,
                  110,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "program",
          "address": "6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P"
        },
        {
          "name": "global_volume_accumulator",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  108,
                  111,
                  98,
                  97,
                  108,
                  95,
                  118,
                  111,
                  108,
                  117,
                  109,
                  101,
                  95,
                  97,
                  99,
                  99,
                  117,
                  109,
                  117,
                  108,
                  97,
                  116,
                  111,
                  114
                ]
              }
            ]
          }
        },
        {
          "name": "user_volume_accumulator",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114,
                  95,
                  118,
                  111,
                  108,
                  117,
                  109,
                  101,
                  95,
                  97,
                  99,
                  99,
                  117,
                  109,
                  117,
                  108,
                  97,
                  116,
                  111,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "user"
              }
            ]
          }
        },
        {
          "name": "fee_config",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  102,
                  101,
                  101,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              },
              {
                "kind": "const",
                "value": [
                  1,
                  86,
                  224,
                  246,
                  147,
                  102,
                  90,
                  207,
                  68,
                  219,
                  21,
                  104,
                  191,
                  23,
                  91,
                  170,
                  81,
                  137,
                  203,
                  151,
                  245,
                  210,
                  255,
                  59,
                  101,
                  93,
                  43,
                  182,
                  253,
                  109,
                  24,
                  176
                ]
              }
            ],
            "program": {
              "kind": "account",
              "path": "fee_program"
            }
          }
        },
        {
          "name": "fee_program",
          "address": "pfeeUxB6jkeY1Hxd7CsFCAjcbHA9rWtchMGdZ6VojVZ"
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        },
        {
          "name": "max_sol_cost",
          "type": "u64"
        },
        {
          "name": "track_volume",
          "type": {
            "defined": {
              "name": "OptionBool"
            }
          }
        },
        {
          "name": "partial_fill",
          "type": {
            "defined": {
              "name": "OptionBool"
            }
          }
        }
      ]
    },
    {
      "name": "buy_exact_quote_in_v2",
      "discriminator": [
        194,
        171,
        28,
        70,
        104,
        77,
        91,
        47
      ],
      "accounts": [
        {
          "name": "global",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  108,
                  111,
                  98,
                  97,
                  108
                ]
              }
            ]
          }
        },
        {
          "name": "base_mint"
        },
        {
          "name": "quote_mint"
        },
        {
          "name": "base_token_program"
        },
        {
          "name": "quote_token_program"
        },
        {
          "name": "associated_token_program",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "fee_recipient",
          "writable": true
        },
        {
          "name": "associated_quote_fee_recipient",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "fee_recipient"
              },
              {
                "kind": "account",
                "path": "quote_token_program"
              },
              {
                "kind": "account",
                "path": "quote_mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "buyback_fee_recipient",
          "writable": true
        },
        {
          "name": "associated_quote_buyback_fee_recipient",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "buyback_fee_recipient"
              },
              {
                "kind": "account",
                "path": "quote_token_program"
              },
              {
                "kind": "account",
                "path": "quote_mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "bonding_curve",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  111,
                  110,
                  100,
                  105,
                  110,
                  103,
                  45,
                  99,
                  117,
                  114,
                  118,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "base_mint"
              }
            ]
          }
        },
        {
          "name": "associated_base_bonding_curve",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "bonding_curve"
              },
              {
                "kind": "account",
                "path": "base_token_program"
              },
              {
                "kind": "account",
                "path": "base_mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "associated_quote_bonding_curve",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "bonding_curve"
              },
              {
                "kind": "account",
                "path": "quote_token_program"
              },
              {
                "kind": "account",
                "path": "quote_mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "associated_base_user",
          "writable": true
        },
        {
          "name": "associated_quote_user",
          "docs": [
            "canonical SPL associated-token PDA. Validated in handlers via",
            "`validate_user_quote_token_account` for non-legacy mints; ignored for legacy (SOL) trades."
          ],
          "writable": true
        },
        {
          "name": "creator_vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  114,
                  101,
                  97,
                  116,
                  111,
                  114,
                  45,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "bonding_curve.creator",
                "account": "BondingCurve"
              }
            ]
          }
        },
        {
          "name": "associated_creator_vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "creator_vault"
              },
              {
                "kind": "account",
                "path": "quote_token_program"
              },
              {
                "kind": "account",
                "path": "quote_mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "sharing_config",
          "docs": [
            "seeds; the account is intentionally not deserialized here because it may be uninitialized",
            "for mints that have not created a fee sharing config. Handlers must check",
            "`data_is_empty()` / owner before reading."
          ],
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  104,
                  97,
                  114,
                  105,
                  110,
                  103,
                  45,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              },
              {
                "kind": "account",
                "path": "base_mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                12,
                53,
                255,
                169,
                5,
                90,
                142,
                86,
                141,
                168,
                247,
                188,
                7,
                86,
                21,
                39,
                76,
                241,
                201,
                44,
                164,
                31,
                64,
                0,
                156,
                81,
                106,
                164,
                20,
                194,
                124,
                112
              ]
            }
          }
        },
        {
          "name": "global_volume_accumulator",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  108,
                  111,
                  98,
                  97,
                  108,
                  95,
                  118,
                  111,
                  108,
                  117,
                  109,
                  101,
                  95,
                  97,
                  99,
                  99,
                  117,
                  109,
                  117,
                  108,
                  97,
                  116,
                  111,
                  114
                ]
              }
            ]
          }
        },
        {
          "name": "user_volume_accumulator",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114,
                  95,
                  118,
                  111,
                  108,
                  117,
                  109,
                  101,
                  95,
                  97,
                  99,
                  99,
                  117,
                  109,
                  117,
                  108,
                  97,
                  116,
                  111,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "user"
              }
            ]
          }
        },
        {
          "name": "associated_user_volume_accumulator",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "user_volume_accumulator"
              },
              {
                "kind": "account",
                "path": "quote_token_program"
              },
              {
                "kind": "account",
                "path": "quote_mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "fee_config",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  102,
                  101,
                  101,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              },
              {
                "kind": "const",
                "value": [
                  1,
                  86,
                  224,
                  246,
                  147,
                  102,
                  90,
                  207,
                  68,
                  219,
                  21,
                  104,
                  191,
                  23,
                  91,
                  170,
                  81,
                  137,
                  203,
                  151,
                  245,
                  210,
                  255,
                  59,
                  101,
                  93,
                  43,
                  182,
                  253,
                  109,
                  24,
                  176
                ]
              }
            ],
            "program": {
              "kind": "account",
              "path": "fee_program"
            }
          }
        },
        {
          "name": "fee_program",
          "address": "pfeeUxB6jkeY1Hxd7CsFCAjcbHA9rWtchMGdZ6VojVZ"
        },
        {
          "name": "system_program",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "event_authority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  95,
                  95,
                  101,
                  118,
                  101,
                  110,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "program",
          "address": "6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P"
        }
      ],
      "args": [
        {
          "name": "spendable_quote_in",
          "type": "u64"
        },
        {
          "name": "min_tokens_out",
          "type": "u64"
        },
        {
          "name": "partial_fill",
          "type": {
            "defined": {
              "name": "OptionBool"
            }
          }
        }
      ]
    },
    {
      "name": "buy_exact_quote_in_v3",
      "discriminator": [
        225,
        247,
        80,
        30,
        213,
        179,
        132,
        136
      ],
      "accounts": [
        {
          "name": "global",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  108,
                  111,
                  98,
                  97,
                  108
                ]
              }
            ]
          }
        },
        {
          "name": "base_mint"
        },
        {
          "name": "quote_mint"
        },
        {
          "name": "base_token_program"
        },
        {
          "name": "quote_token_program"
        },
        {
          "name": "bonding_curve",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  111,
                  110,
                  100,
                  105,
                  110,
                  103,
                  45,
                  99,
                  117,
                  114,
                  118,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "base_mint"
              }
            ]
          }
        },
        {
          "name": "associated_base_bonding_curve",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "bonding_curve"
              },
              {
                "kind": "account",
                "path": "base_token_program"
              },
              {
                "kind": "account",
                "path": "base_mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "associated_quote_bonding_curve",
          "docs": [
            "Must already exist on a token quote (create_v2 creates it); ignored on a SOL quote."
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "bonding_curve"
              },
              {
                "kind": "account",
                "path": "quote_token_program"
              },
              {
                "kind": "account",
                "path": "quote_mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "associated_base_user",
          "writable": true
        },
        {
          "name": "associated_quote_user",
          "docs": [
            "canonical SPL associated-token PDA. Validated in the handlers via",
            "`validate_user_quote_token_account` for non-legacy mints; ignored for legacy (SOL) trades."
          ],
          "writable": true
        },
        {
          "name": "user_volume_accumulator",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114,
                  95,
                  118,
                  111,
                  108,
                  117,
                  109,
                  101,
                  95,
                  97,
                  99,
                  99,
                  117,
                  109,
                  117,
                  108,
                  97,
                  116,
                  111,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "user"
              }
            ]
          }
        },
        {
          "name": "fee_config",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  102,
                  101,
                  101,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              },
              {
                "kind": "const",
                "value": [
                  1,
                  86,
                  224,
                  246,
                  147,
                  102,
                  90,
                  207,
                  68,
                  219,
                  21,
                  104,
                  191,
                  23,
                  91,
                  170,
                  81,
                  137,
                  203,
                  151,
                  245,
                  210,
                  255,
                  59,
                  101,
                  93,
                  43,
                  182,
                  253,
                  109,
                  24,
                  176
                ]
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                12,
                53,
                255,
                169,
                5,
                90,
                142,
                86,
                141,
                168,
                247,
                188,
                7,
                86,
                21,
                39,
                76,
                241,
                201,
                44,
                164,
                31,
                64,
                0,
                156,
                81,
                106,
                164,
                20,
                194,
                124,
                112
              ]
            }
          }
        },
        {
          "name": "buyback_fee_recipient",
          "writable": true
        },
        {
          "name": "system_program",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "event_authority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  95,
                  95,
                  101,
                  118,
                  101,
                  110,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "program",
          "address": "6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P"
        }
      ],
      "args": [
        {
          "name": "spendable_quote_in",
          "type": "u64"
        },
        {
          "name": "min_tokens_out",
          "type": "u64"
        },
        {
          "name": "partial_fill",
          "type": {
            "defined": {
              "name": "OptionBool"
            }
          }
        }
      ]
    },
    {
      "name": "buy_exact_sol_in",
      "docs": [
        "Given a budget of spendable SOL, buy at least min_tokens_out tokens.",
        "Fees are deducted from spendable_sol_in.",
        "",
        "# Quote formulas",
        "Where:",
        "- total_fee_bps = protocol_fee_bps + creator_fee_bps (creator_fee_bps is 0 if no creator)",
        "- floor(a/b) = a / b (integer division)",
        "- ceil(a/b) = (a + b - 1) / b",
        "",
        "SOL → tokens quote",
        "To calculate tokens_out for a given spendable_sol_in:",
        "1. net_sol = floor(spendable_sol_in * 10_000 / (10_000 + total_fee_bps))",
        "2. fees = ceil(net_sol * protocol_fee_bps / 10_000) + ceil(net_sol * creator_fee_bps / 10_000) (creator_fee_bps is 0 if no creator)",
        "3. if net_sol + fees > spendable_sol_in: net_sol = net_sol - (net_sol + fees - spendable_sol_in)",
        "4. tokens_out = floor((net_sol - 1) * virtual_token_reserves / (virtual_sol_reserves + net_sol - 1))",
        "",
        "Reverse quote (tokens → SOL)",
        "To calculate spendable_sol_in for a desired number of tokens:",
        "1. net_sol = ceil(tokens * virtual_sol_reserves / (virtual_token_reserves - tokens)) + 1",
        "2. spendable_sol_in = ceil(net_sol * (10_000 + total_fee_bps) / 10_000)",
        "",
        "Rent",
        "Separately make sure the instruction's payer has enough SOL to cover rent for:",
        "- creator_vault: rent.minimum_balance(0)",
        "- user_volume_accumulator: rent.minimum_balance(UserVolumeAccumulator::LEN)"
      ],
      "discriminator": [
        56,
        252,
        116,
        8,
        158,
        223,
        205,
        95
      ],
      "accounts": [
        {
          "name": "global",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  108,
                  111,
                  98,
                  97,
                  108
                ]
              }
            ]
          }
        },
        {
          "name": "fee_recipient",
          "writable": true
        },
        {
          "name": "mint"
        },
        {
          "name": "bonding_curve",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  111,
                  110,
                  100,
                  105,
                  110,
                  103,
                  45,
                  99,
                  117,
                  114,
                  118,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        },
        {
          "name": "associated_bonding_curve",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "bonding_curve"
              },
              {
                "kind": "account",
                "path": "token_program"
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "associated_user",
          "writable": true
        },
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "system_program",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "token_program"
        },
        {
          "name": "creator_vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  114,
                  101,
                  97,
                  116,
                  111,
                  114,
                  45,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "bonding_curve.creator",
                "account": "BondingCurve"
              }
            ]
          }
        },
        {
          "name": "event_authority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  95,
                  95,
                  101,
                  118,
                  101,
                  110,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "program",
          "address": "6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P"
        },
        {
          "name": "global_volume_accumulator",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  108,
                  111,
                  98,
                  97,
                  108,
                  95,
                  118,
                  111,
                  108,
                  117,
                  109,
                  101,
                  95,
                  97,
                  99,
                  99,
                  117,
                  109,
                  117,
                  108,
                  97,
                  116,
                  111,
                  114
                ]
              }
            ]
          }
        },
        {
          "name": "user_volume_accumulator",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114,
                  95,
                  118,
                  111,
                  108,
                  117,
                  109,
                  101,
                  95,
                  97,
                  99,
                  99,
                  117,
                  109,
                  117,
                  108,
                  97,
                  116,
                  111,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "user"
              }
            ]
          }
        },
        {
          "name": "fee_config",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  102,
                  101,
                  101,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              },
              {
                "kind": "const",
                "value": [
                  1,
                  86,
                  224,
                  246,
                  147,
                  102,
                  90,
                  207,
                  68,
                  219,
                  21,
                  104,
                  191,
                  23,
                  91,
                  170,
                  81,
                  137,
                  203,
                  151,
                  245,
                  210,
                  255,
                  59,
                  101,
                  93,
                  43,
                  182,
                  253,
                  109,
                  24,
                  176
                ]
              }
            ],
            "program": {
              "kind": "account",
              "path": "fee_program"
            }
          }
        },
        {
          "name": "fee_program",
          "address": "pfeeUxB6jkeY1Hxd7CsFCAjcbHA9rWtchMGdZ6VojVZ"
        }
      ],
      "args": [
        {
          "name": "spendable_sol_in",
          "type": "u64"
        },
        {
          "name": "min_tokens_out",
          "type": "u64"
        },
        {
          "name": "track_volume",
          "type": {
            "defined": {
              "name": "OptionBool"
            }
          }
        },
        {
          "name": "partial_fill",
          "type": {
            "defined": {
              "name": "OptionBool"
            }
          }
        }
      ]
    },
    {
      "name": "buy_v2",
      "discriminator": [
        184,
        23,
        238,
        97,
        103,
        197,
        211,
        61
      ],
      "accounts": [
        {
          "name": "global",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  108,
                  111,
                  98,
                  97,
                  108
                ]
              }
            ]
          }
        },
        {
          "name": "base_mint"
        },
        {
          "name": "quote_mint"
        },
        {
          "name": "base_token_program"
        },
        {
          "name": "quote_token_program"
        },
        {
          "name": "associated_token_program",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "fee_recipient",
          "writable": true
        },
        {
          "name": "associated_quote_fee_recipient",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "fee_recipient"
              },
              {
                "kind": "account",
                "path": "quote_token_program"
              },
              {
                "kind": "account",
                "path": "quote_mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "buyback_fee_recipient",
          "writable": true
        },
        {
          "name": "associated_quote_buyback_fee_recipient",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "buyback_fee_recipient"
              },
              {
                "kind": "account",
                "path": "quote_token_program"
              },
              {
                "kind": "account",
                "path": "quote_mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "bonding_curve",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  111,
                  110,
                  100,
                  105,
                  110,
                  103,
                  45,
                  99,
                  117,
                  114,
                  118,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "base_mint"
              }
            ]
          }
        },
        {
          "name": "associated_base_bonding_curve",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "bonding_curve"
              },
              {
                "kind": "account",
                "path": "base_token_program"
              },
              {
                "kind": "account",
                "path": "base_mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "associated_quote_bonding_curve",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "bonding_curve"
              },
              {
                "kind": "account",
                "path": "quote_token_program"
              },
              {
                "kind": "account",
                "path": "quote_mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "associated_base_user",
          "writable": true
        },
        {
          "name": "associated_quote_user",
          "docs": [
            "canonical SPL associated-token PDA. Validated in handlers via",
            "`validate_user_quote_token_account` for non-legacy mints; ignored for legacy (SOL) trades."
          ],
          "writable": true
        },
        {
          "name": "creator_vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  114,
                  101,
                  97,
                  116,
                  111,
                  114,
                  45,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "bonding_curve.creator",
                "account": "BondingCurve"
              }
            ]
          }
        },
        {
          "name": "associated_creator_vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "creator_vault"
              },
              {
                "kind": "account",
                "path": "quote_token_program"
              },
              {
                "kind": "account",
                "path": "quote_mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "sharing_config",
          "docs": [
            "seeds; the account is intentionally not deserialized here because it may be uninitialized",
            "for mints that have not created a fee sharing config. Handlers must check",
            "`data_is_empty()` / owner before reading."
          ],
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  104,
                  97,
                  114,
                  105,
                  110,
                  103,
                  45,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              },
              {
                "kind": "account",
                "path": "base_mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                12,
                53,
                255,
                169,
                5,
                90,
                142,
                86,
                141,
                168,
                247,
                188,
                7,
                86,
                21,
                39,
                76,
                241,
                201,
                44,
                164,
                31,
                64,
                0,
                156,
                81,
                106,
                164,
                20,
                194,
                124,
                112
              ]
            }
          }
        },
        {
          "name": "global_volume_accumulator",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  108,
                  111,
                  98,
                  97,
                  108,
                  95,
                  118,
                  111,
                  108,
                  117,
                  109,
                  101,
                  95,
                  97,
                  99,
                  99,
                  117,
                  109,
                  117,
                  108,
                  97,
                  116,
                  111,
                  114
                ]
              }
            ]
          }
        },
        {
          "name": "user_volume_accumulator",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114,
                  95,
                  118,
                  111,
                  108,
                  117,
                  109,
                  101,
                  95,
                  97,
                  99,
                  99,
                  117,
                  109,
                  117,
                  108,
                  97,
                  116,
                  111,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "user"
              }
            ]
          }
        },
        {
          "name": "associated_user_volume_accumulator",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "user_volume_accumulator"
              },
              {
                "kind": "account",
                "path": "quote_token_program"
              },
              {
                "kind": "account",
                "path": "quote_mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "fee_config",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  102,
                  101,
                  101,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              },
              {
                "kind": "const",
                "value": [
                  1,
                  86,
                  224,
                  246,
                  147,
                  102,
                  90,
                  207,
                  68,
                  219,
                  21,
                  104,
                  191,
                  23,
                  91,
                  170,
                  81,
                  137,
                  203,
                  151,
                  245,
                  210,
                  255,
                  59,
                  101,
                  93,
                  43,
                  182,
                  253,
                  109,
                  24,
                  176
                ]
              }
            ],
            "program": {
              "kind": "account",
              "path": "fee_program"
            }
          }
        },
        {
          "name": "fee_program",
          "address": "pfeeUxB6jkeY1Hxd7CsFCAjcbHA9rWtchMGdZ6VojVZ"
        },
        {
          "name": "system_program",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "event_authority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  95,
                  95,
                  101,
                  118,
                  101,
                  110,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "program",
          "address": "6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P"
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        },
        {
          "name": "max_sol_cost",
          "type": "u64"
        },
        {
          "name": "partial_fill",
          "type": {
            "defined": {
              "name": "OptionBool"
            }
          }
        }
      ]
    },
    {
      "name": "buy_v3",
      "discriminator": [
        7,
        5,
        29,
        196,
        245,
        23,
        101,
        80
      ],
      "accounts": [
        {
          "name": "global",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  108,
                  111,
                  98,
                  97,
                  108
                ]
              }
            ]
          }
        },
        {
          "name": "base_mint"
        },
        {
          "name": "quote_mint"
        },
        {
          "name": "base_token_program"
        },
        {
          "name": "quote_token_program"
        },
        {
          "name": "bonding_curve",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  111,
                  110,
                  100,
                  105,
                  110,
                  103,
                  45,
                  99,
                  117,
                  114,
                  118,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "base_mint"
              }
            ]
          }
        },
        {
          "name": "associated_base_bonding_curve",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "bonding_curve"
              },
              {
                "kind": "account",
                "path": "base_token_program"
              },
              {
                "kind": "account",
                "path": "base_mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "associated_quote_bonding_curve",
          "docs": [
            "Must already exist on a token quote (create_v2 creates it); ignored on a SOL quote."
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "bonding_curve"
              },
              {
                "kind": "account",
                "path": "quote_token_program"
              },
              {
                "kind": "account",
                "path": "quote_mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "associated_base_user",
          "writable": true
        },
        {
          "name": "associated_quote_user",
          "docs": [
            "canonical SPL associated-token PDA. Validated in the handlers via",
            "`validate_user_quote_token_account` for non-legacy mints; ignored for legacy (SOL) trades."
          ],
          "writable": true
        },
        {
          "name": "user_volume_accumulator",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114,
                  95,
                  118,
                  111,
                  108,
                  117,
                  109,
                  101,
                  95,
                  97,
                  99,
                  99,
                  117,
                  109,
                  117,
                  108,
                  97,
                  116,
                  111,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "user"
              }
            ]
          }
        },
        {
          "name": "fee_config",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  102,
                  101,
                  101,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              },
              {
                "kind": "const",
                "value": [
                  1,
                  86,
                  224,
                  246,
                  147,
                  102,
                  90,
                  207,
                  68,
                  219,
                  21,
                  104,
                  191,
                  23,
                  91,
                  170,
                  81,
                  137,
                  203,
                  151,
                  245,
                  210,
                  255,
                  59,
                  101,
                  93,
                  43,
                  182,
                  253,
                  109,
                  24,
                  176
                ]
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                12,
                53,
                255,
                169,
                5,
                90,
                142,
                86,
                141,
                168,
                247,
                188,
                7,
                86,
                21,
                39,
                76,
                241,
                201,
                44,
                164,
                31,
                64,
                0,
                156,
                81,
                106,
                164,
                20,
                194,
                124,
                112
              ]
            }
          }
        },
        {
          "name": "buyback_fee_recipient",
          "writable": true
        },
        {
          "name": "system_program",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "event_authority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  95,
                  95,
                  101,
                  118,
                  101,
                  110,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "program",
          "address": "6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P"
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        },
        {
          "name": "max_sol_cost",
          "type": "u64"
        },
        {
          "name": "partial_fill",
          "type": {
            "defined": {
              "name": "OptionBool"
            }
          }
        }
      ]
    },
    {
      "name": "claim_cashback",
      "discriminator": [
        37,
        58,
        35,
        126,
        190,
        53,
        228,
        197
      ],
      "accounts": [
        {
          "name": "user",
          "writable": true
        },
        {
          "name": "user_volume_accumulator",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114,
                  95,
                  118,
                  111,
                  108,
                  117,
                  109,
                  101,
                  95,
                  97,
                  99,
                  99,
                  117,
                  109,
                  117,
                  108,
                  97,
                  116,
                  111,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "user"
              }
            ]
          }
        },
        {
          "name": "system_program",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "event_authority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  95,
                  95,
                  101,
                  118,
                  101,
                  110,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "program",
          "address": "6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P"
        }
      ],
      "args": []
    },
    {
      "name": "claim_cashback_v2",
      "docs": [
        "Pays out the user's accrued cashback. For a token quote, `associated_quote_user` may be",
        "any token account of `quote_mint` owned by `user`, not only the associated one."
      ],
      "discriminator": [
        122,
        243,
        204,
        65,
        94,
        116,
        29,
        55
      ],
      "accounts": [
        {
          "name": "user",
          "writable": true
        },
        {
          "name": "user_volume_accumulator",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114,
                  95,
                  118,
                  111,
                  108,
                  117,
                  109,
                  101,
                  95,
                  97,
                  99,
                  99,
                  117,
                  109,
                  117,
                  108,
                  97,
                  116,
                  111,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "user"
              }
            ]
          }
        },
        {
          "name": "quote_mint"
        },
        {
          "name": "quote_token_program"
        },
        {
          "name": "associated_token_program",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "associated_user_volume_accumulator",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "user_volume_accumulator"
              },
              {
                "kind": "account",
                "path": "quote_token_program"
              },
              {
                "kind": "account",
                "path": "quote_mint"
              }
            ],
            "program": {
              "kind": "account",
              "path": "associated_token_program"
            }
          }
        },
        {
          "name": "associated_quote_user",
          "writable": true
        },
        {
          "name": "system_program",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "event_authority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  95,
                  95,
                  101,
                  118,
                  101,
                  110,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "program",
          "address": "6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P"
        }
      ],
      "args": []
    },
    {
      "name": "claim_token_incentives",
      "discriminator": [
        16,
        4,
        71,
        28,
        204,
        1,
        40,
        27
      ],
      "accounts": [
        {
          "name": "user"
        },
        {
          "name": "user_ata",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "user"
              },
              {
                "kind": "account",
                "path": "token_program"
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "global_volume_accumulator",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  108,
                  111,
                  98,
                  97,
                  108,
                  95,
                  118,
                  111,
                  108,
                  117,
                  109,
                  101,
                  95,
                  97,
                  99,
                  99,
                  117,
                  109,
                  117,
                  108,
                  97,
                  116,
                  111,
                  114
                ]
              }
            ]
          }
        },
        {
          "name": "global_incentive_token_account",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "global_volume_accumulator"
              },
              {
                "kind": "account",
                "path": "token_program"
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "user_volume_accumulator",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114,
                  95,
                  118,
                  111,
                  108,
                  117,
                  109,
                  101,
                  95,
                  97,
                  99,
                  99,
                  117,
                  109,
                  117,
                  108,
                  97,
                  116,
                  111,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "user"
              }
            ]
          }
        },
        {
          "name": "mint",
          "relations": [
            "global_volume_accumulator"
          ]
        },
        {
          "name": "token_program"
        },
        {
          "name": "system_program",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "associated_token_program",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "event_authority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  95,
                  95,
                  101,
                  118,
                  101,
                  110,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "program",
          "address": "6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P"
        },
        {
          "name": "payer",
          "writable": true,
          "signer": true
        }
      ],
      "args": []
    },
    {
      "name": "close_user_volume_accumulator",
      "discriminator": [
        249,
        69,
        164,
        218,
        150,
        103,
        84,
        138
      ],
      "accounts": [
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "user_volume_accumulator",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114,
                  95,
                  118,
                  111,
                  108,
                  117,
                  109,
                  101,
                  95,
                  97,
                  99,
                  99,
                  117,
                  109,
                  117,
                  108,
                  97,
                  116,
                  111,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "user"
              }
            ]
          }
        },
        {
          "name": "event_authority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  95,
                  95,
                  101,
                  118,
                  101,
                  110,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "program"
        }
      ],
      "args": []
    },
    {
      "name": "collect_creator_fee",
      "docs": [
        "Collects creator_fee from creator_vault to the coin creator account"
      ],
      "discriminator": [
        20,
        22,
        86,
        123,
        198,
        28,
        219,
        132
      ],
      "accounts": [
        {
          "name": "creator",
          "writable": true
        },
        {
          "name": "creator_vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  114,
                  101,
                  97,
                  116,
                  111,
                  114,
                  45,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "creator"
              }
            ]
          }
        },
        {
          "name": "system_program",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "event_authority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  95,
                  95,
                  101,
                  118,
                  101,
                  110,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "program"
        }
      ],
      "args": []
    },
    {
      "name": "collect_creator_fee_v2",
      "docs": [
        "Collects creator_fee from creator_vault to the coin creator account"
      ],
      "discriminator": [
        207,
        17,
        138,
        242,
        4,
        34,
        19,
        56
      ],
      "accounts": [
        {
          "name": "creator",
          "writable": true
        },
        {
          "name": "creator_token_account",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "creator"
              },
              {
                "kind": "account",
                "path": "quote_token_program"
              },
              {
                "kind": "account",
                "path": "quote_mint"
              }
            ],
            "program": {
              "kind": "account",
              "path": "associated_token_program"
            }
          }
        },
        {
          "name": "creator_vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  114,
                  101,
                  97,
                  116,
                  111,
                  114,
                  45,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "creator"
              }
            ]
          }
        },
        {
          "name": "creator_vault_token_account",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "creator_vault"
              },
              {
                "kind": "account",
                "path": "quote_token_program"
              },
              {
                "kind": "account",
                "path": "quote_mint"
              }
            ],
            "program": {
              "kind": "account",
              "path": "associated_token_program"
            }
          }
        },
        {
          "name": "quote_mint"
        },
        {
          "name": "quote_token_program"
        },
        {
          "name": "associated_token_program",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "system_program",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "event_authority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  95,
                  95,
                  101,
                  118,
                  101,
                  110,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "program"
        }
      ],
      "args": []
    },
    {
      "name": "create",
      "docs": [
        "Creates a new coin and bonding curve."
      ],
      "discriminator": [
        24,
        30,
        200,
        40,
        5,
        28,
        7,
        119
      ],
      "accounts": [
        {
          "name": "mint",
          "writable": true,
          "signer": true
        },
        {
          "name": "mint_authority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  105,
                  110,
                  116,
                  45,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "bonding_curve",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  111,
                  110,
                  100,
                  105,
                  110,
                  103,
                  45,
                  99,
                  117,
                  114,
                  118,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        },
        {
          "name": "associated_bonding_curve",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "bonding_curve"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "global",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  108,
                  111,
                  98,
                  97,
                  108
                ]
              }
            ]
          }
        },
        {
          "name": "mpl_token_metadata",
          "address": "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
        },
        {
          "name": "metadata",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  101,
                  116,
                  97,
                  100,
                  97,
                  116,
                  97
                ]
              },
              {
                "kind": "const",
                "value": [
                  11,
                  112,
                  101,
                  177,
                  227,
                  209,
                  124,
                  69,
                  56,
                  157,
                  82,
                  127,
                  107,
                  4,
                  195,
                  205,
                  88,
                  184,
                  108,
                  115,
                  26,
                  160,
                  253,
                  181,
                  73,
                  182,
                  209,
                  188,
                  3,
                  248,
                  41,
                  70
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ],
            "program": {
              "kind": "account",
              "path": "mpl_token_metadata"
            }
          }
        },
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "system_program",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "token_program",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "associated_token_program",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "rent",
          "address": "SysvarRent111111111111111111111111111111111"
        },
        {
          "name": "event_authority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  95,
                  95,
                  101,
                  118,
                  101,
                  110,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "program"
        }
      ],
      "args": [
        {
          "name": "name",
          "type": "string"
        },
        {
          "name": "symbol",
          "type": "string"
        },
        {
          "name": "uri",
          "type": "string"
        },
        {
          "name": "creator",
          "type": "pubkey"
        }
      ]
    },
    {
      "name": "create_v2",
      "docs": [
        "Creates a new spl-22 coin and bonding curve.",
        "",
        "Remaining accounts select the quote mint (none = SOL): `quote_mint`,",
        "`associated_quote_bonding_curve`, `quote_token_program` (SPL Token or Token-2022; must own",
        "the mint), plus an optional fourth account, the `quote-control` PDA, read only when `Global`",
        "does not whitelist the mint. A mint admitted through quote-control seeds the curve's",
        "virtual quote reserves from its quote-control entry instead of `Global`, and cannot be",
        "used with `is_mayhem_mode` (`MayhemModeQuoteMintNotAllowed`). When neither list admits the",
        "mint Q, an optional fifth account, Q's own pump `bonding-curve` PDA, admits a pump coin as",
        "the quote (`InvalidQuoteBondingCurve` if it is not that PDA; missing keeps",
        "`UnsupportedQuoteMint`): the new curve's depth, Q's depth plus one, must not exceed",
        "`Global.max_curve_depth` or the program's cap of 5 (`CurveDepthExceeded`; 0 disables the",
        "path, 1 admits children of depth-0 coins only), and Q's curve must not be mayhem mode",
        "(`QuoteBondingCurveNotEligible`). The new curve's virtual quote reserves are then derived",
        "from the live reserves of every coin on Q's quote chain, Q down to its depth-0 root R (Q",
        "itself at depth 1), whose own quote must be SOL, a `Global`-whitelisted mint or a",
        "quote-control mint (`QuoteBondingCurveNotEligible`): the graduation raise of a Target, the",
        "seed a fresh curve in R's quote would get today, is bought on R's constant product, the R",
        "tokens that returns are bought on the next coin up, and so on to Q; the Q tokens the last",
        "buy returns are the new curve's graduation raise and its seed is that raise scaled back by",
        "the curve's raise ratio. Each coin is priced over its curve `virtual_token_reserves` and",
        "`virtual_quote_reserves` while its curve trades, a buy past its real token reserves",
        "completing the curve at the remainder's price and continuing in the pool the migration",
        "would create (the migration deposit against the raise, as `buy_v3` does), or over its",
        "canonical pump-amm pool base vault balance and its quote vault balance plus",
        "`Pool.virtual_quote_reserves` once it is migrated (a complete coin not yet migrated fails",
        "`QuoteCurveAwaitingMigration`). The chain",
        "follows Q's group: one group per coin below Q, nearest first, each the coin's",
        "`bonding-curve` PDA alone while it trades or that PDA followed by its pool (index 0 under",
        "pump's `pool-authority` PDA for the coin, quote seed WSOL for a SOL-quoted coin) and the",
        "pool's base and quote vaults once migrated, Q's own pool accounts being the sixth to",
        "eighth (`QuoteChainAccountsRequired`, `QuotePoolAccountsRequired`, `QuotePoolNotFound`,",
        "`InvalidQuotePool`). The derived value must be at least 1 (`QuoteReservesOutOfRange`); each",
        "buy returns less than that coin's token side, so there is no supply bound. The new curve",
        "stores `depth = Q.depth + 1` and, like a quote-control coin, cannot be mayhem mode. The Token-2022",
        "native mint is rejected, and a Token-2022 quote mint may only carry the xStock operable",
        "extension set (metadata pointer/metadata, permanent delegate, initialized default account",
        "state, scaled UI amount, pausable, confidential-transfer mint, and a transfer hook with no",
        "program). The trailing `creator_fee_bps` argument (EOF-tolerant) sets the coin's own creator",
        "fee rate for a quote mint admitted through quote-control or through a pump coin's curve,",
        "and then requires `Global.creator_fee_configurable`, a non-cashback coin and a value in",
        "`1..=Global.max_configurable_creator_fee_bps`; on a SOL or `Global`-whitelisted quote it is",
        "ignored, and omitted or zero stores 0 so the pump-fees schedule rate applies.",
        "`is_cashback_enabled` is deprecated and must be false. `is_holder_reward` (EOF-tolerant,",
        "gated by `Global.is_holder_reward_enabled`) sets the creator to the `holder-rewards` PDA",
        "of the mint, so creator fees accrue to its creator vault, are collected onto the PDA with",
        "`collect_creator_fee*` and paid out through `distribute_fee_to_holders`."
      ],
      "discriminator": [
        214,
        144,
        76,
        236,
        95,
        139,
        49,
        180
      ],
      "accounts": [
        {
          "name": "mint",
          "writable": true,
          "signer": true
        },
        {
          "name": "mint_authority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  105,
                  110,
                  116,
                  45,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "bonding_curve",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  111,
                  110,
                  100,
                  105,
                  110,
                  103,
                  45,
                  99,
                  117,
                  114,
                  118,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        },
        {
          "name": "associated_bonding_curve",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "bonding_curve"
              },
              {
                "kind": "account",
                "path": "token_program"
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "global",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  108,
                  111,
                  98,
                  97,
                  108
                ]
              }
            ]
          }
        },
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "system_program",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "token_program",
          "address": "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb"
        },
        {
          "name": "associated_token_program",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "mayhem_program_id",
          "writable": true,
          "address": "MAyhSmzXzV1pTf7LsNkrNwkWKTo4ougAJ1PPg47MD4e"
        },
        {
          "name": "global_params",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  108,
                  111,
                  98,
                  97,
                  108,
                  45,
                  112,
                  97,
                  114,
                  97,
                  109,
                  115
                ]
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                5,
                42,
                229,
                215,
                167,
                218,
                167,
                36,
                166,
                234,
                176,
                167,
                41,
                84,
                145,
                133,
                90,
                212,
                160,
                103,
                22,
                96,
                103,
                76,
                78,
                3,
                69,
                89,
                128,
                61,
                101,
                163
              ]
            }
          }
        },
        {
          "name": "sol_vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  111,
                  108,
                  45,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                5,
                42,
                229,
                215,
                167,
                218,
                167,
                36,
                166,
                234,
                176,
                167,
                41,
                84,
                145,
                133,
                90,
                212,
                160,
                103,
                22,
                96,
                103,
                76,
                78,
                3,
                69,
                89,
                128,
                61,
                101,
                163
              ]
            }
          }
        },
        {
          "name": "mayhem_state",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  97,
                  121,
                  104,
                  101,
                  109,
                  45,
                  115,
                  116,
                  97,
                  116,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                5,
                42,
                229,
                215,
                167,
                218,
                167,
                36,
                166,
                234,
                176,
                167,
                41,
                84,
                145,
                133,
                90,
                212,
                160,
                103,
                22,
                96,
                103,
                76,
                78,
                3,
                69,
                89,
                128,
                61,
                101,
                163
              ]
            }
          }
        },
        {
          "name": "mayhem_token_vault",
          "writable": true
        },
        {
          "name": "event_authority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  95,
                  95,
                  101,
                  118,
                  101,
                  110,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "program"
        }
      ],
      "args": [
        {
          "name": "name",
          "type": "string"
        },
        {
          "name": "symbol",
          "type": "string"
        },
        {
          "name": "uri",
          "type": "string"
        },
        {
          "name": "creator",
          "type": "pubkey"
        },
        {
          "name": "is_mayhem_mode",
          "type": "bool"
        },
        {
          "name": "is_cashback_enabled",
          "type": {
            "defined": {
              "name": "OptionBool"
            }
          }
        },
        {
          "name": "creator_fee_bps",
          "type": {
            "defined": {
              "name": "OptionU64"
            }
          }
        },
        {
          "name": "is_holder_reward",
          "type": {
            "defined": {
              "name": "OptionBool"
            }
          }
        }
      ]
    },
    {
      "name": "distribute_creator_fees",
      "docs": [
        "Distributes creator fees to shareholders based on their share percentages",
        "The creator vault needs to have at least the minimum distributable amount to distribute fees",
        "This can be checked with the get_minimum_distributable_fee instruction"
      ],
      "discriminator": [
        165,
        114,
        103,
        0,
        121,
        206,
        247,
        81
      ],
      "accounts": [
        {
          "name": "mint",
          "relations": [
            "sharing_config"
          ]
        },
        {
          "name": "bonding_curve",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  111,
                  110,
                  100,
                  105,
                  110,
                  103,
                  45,
                  99,
                  117,
                  114,
                  118,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        },
        {
          "name": "sharing_config",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  104,
                  97,
                  114,
                  105,
                  110,
                  103,
                  45,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                12,
                53,
                255,
                169,
                5,
                90,
                142,
                86,
                141,
                168,
                247,
                188,
                7,
                86,
                21,
                39,
                76,
                241,
                201,
                44,
                164,
                31,
                64,
                0,
                156,
                81,
                106,
                164,
                20,
                194,
                124,
                112
              ]
            }
          }
        },
        {
          "name": "creator_vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  114,
                  101,
                  97,
                  116,
                  111,
                  114,
                  45,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "bonding_curve.creator",
                "account": "BondingCurve"
              }
            ]
          }
        },
        {
          "name": "system_program",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "event_authority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  95,
                  95,
                  101,
                  118,
                  101,
                  110,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "program",
          "address": "6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P"
        }
      ],
      "args": [],
      "returns": {
        "defined": {
          "name": "DistributeCreatorFeesEvent"
        }
      }
    },
    {
      "name": "distribute_creator_fees_v2",
      "discriminator": [
        255,
        203,
        19,
        79,
        244,
        68,
        8,
        159
      ],
      "accounts": [
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "mint",
          "relations": [
            "sharing_config"
          ]
        },
        {
          "name": "bonding_curve",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  111,
                  110,
                  100,
                  105,
                  110,
                  103,
                  45,
                  99,
                  117,
                  114,
                  118,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        },
        {
          "name": "sharing_config",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  104,
                  97,
                  114,
                  105,
                  110,
                  103,
                  45,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                12,
                53,
                255,
                169,
                5,
                90,
                142,
                86,
                141,
                168,
                247,
                188,
                7,
                86,
                21,
                39,
                76,
                241,
                201,
                44,
                164,
                31,
                64,
                0,
                156,
                81,
                106,
                164,
                20,
                194,
                124,
                112
              ]
            }
          }
        },
        {
          "name": "creator_vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  114,
                  101,
                  97,
                  116,
                  111,
                  114,
                  45,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "bonding_curve.creator",
                "account": "BondingCurve"
              }
            ]
          }
        },
        {
          "name": "system_program",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "event_authority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  95,
                  95,
                  101,
                  118,
                  101,
                  110,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "program",
          "address": "6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P"
        },
        {
          "name": "creator_vault_quote_token_account",
          "docs": [
            "Deserialized manually in the handler for non-legacy quote mints."
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "creator_vault"
              },
              {
                "kind": "account",
                "path": "quote_token_program"
              },
              {
                "kind": "account",
                "path": "quote_mint"
              }
            ],
            "program": {
              "kind": "account",
              "path": "associated_token_program"
            }
          }
        },
        {
          "name": "quote_mint"
        },
        {
          "name": "quote_token_program"
        },
        {
          "name": "associated_token_program",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        }
      ],
      "args": [
        {
          "name": "initialize_ata",
          "type": "bool"
        }
      ],
      "returns": {
        "defined": {
          "name": "DistributeCreatorFeesEvent"
        }
      }
    },
    {
      "name": "distribute_fee_to_holders",
      "docs": [
        "Pays fees collected on the `holder-rewards` PDA (via `collect_creator_fee*` with the PDA",
        "as creator) out to holders: `amounts[i]` goes to remaining accounts `[2i]` (owner) /",
        "`[2i + 1]` (its quote ATA, created if missing). `holder_rewards_token_account` is any",
        "quote token account owned by the PDA (normally its ATA): the source on a token quote, and",
        "on a SOL quote a parked WSOL account closed into the PDA first; pass the program id when",
        "there is none. Signed by `Global.holder_reward_claim_authority`."
      ],
      "discriminator": [
        98,
        54,
        145,
        97,
        2,
        70,
        173,
        43
      ],
      "accounts": [
        {
          "name": "global",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  108,
                  111,
                  98,
                  97,
                  108
                ]
              }
            ]
          }
        },
        {
          "name": "holder_reward_claim_authority",
          "writable": true,
          "signer": true,
          "relations": [
            "global"
          ]
        },
        {
          "name": "mint"
        },
        {
          "name": "holder_rewards",
          "docs": [
            "deliver the collected fees here (lamports on a SOL quote)"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  104,
                  111,
                  108,
                  100,
                  101,
                  114,
                  45,
                  114,
                  101,
                  119,
                  97,
                  114,
                  100,
                  115
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        },
        {
          "name": "holder_rewards_token_account",
          "writable": true,
          "optional": true
        },
        {
          "name": "quote_mint"
        },
        {
          "name": "quote_token_program"
        },
        {
          "name": "associated_token_program",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "system_program",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "event_authority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  95,
                  95,
                  101,
                  118,
                  101,
                  110,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "program"
        }
      ],
      "args": [
        {
          "name": "amounts",
          "type": {
            "vec": "u64"
          }
        }
      ]
    },
    {
      "name": "extend_account",
      "docs": [
        "Extends the size of program-owned accounts"
      ],
      "discriminator": [
        234,
        102,
        194,
        203,
        150,
        72,
        62,
        229
      ],
      "accounts": [
        {
          "name": "account",
          "writable": true
        },
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "system_program",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "event_authority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  95,
                  95,
                  101,
                  118,
                  101,
                  110,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "program"
        }
      ],
      "args": []
    },
    {
      "name": "get_minimum_distributable_fee",
      "docs": [
        "Permissionless instruction to check the minimum required fees for distribution",
        "Returns the minimum required balance from the creator_vault and whether distribution can proceed"
      ],
      "discriminator": [
        117,
        225,
        127,
        202,
        134,
        95,
        68,
        35
      ],
      "accounts": [
        {
          "name": "mint",
          "relations": [
            "sharing_config"
          ]
        },
        {
          "name": "bonding_curve",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  111,
                  110,
                  100,
                  105,
                  110,
                  103,
                  45,
                  99,
                  117,
                  114,
                  118,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        },
        {
          "name": "sharing_config",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  104,
                  97,
                  114,
                  105,
                  110,
                  103,
                  45,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                12,
                53,
                255,
                169,
                5,
                90,
                142,
                86,
                141,
                168,
                247,
                188,
                7,
                86,
                21,
                39,
                76,
                241,
                201,
                44,
                164,
                31,
                64,
                0,
                156,
                81,
                106,
                164,
                20,
                194,
                124,
                112
              ]
            }
          }
        },
        {
          "name": "creator_vault",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  114,
                  101,
                  97,
                  116,
                  111,
                  114,
                  45,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "bonding_curve.creator",
                "account": "BondingCurve"
              }
            ]
          }
        }
      ],
      "args": [],
      "returns": {
        "defined": {
          "name": "MinimumDistributableFeeEvent"
        }
      }
    },
    {
      "name": "init_user_volume_accumulator",
      "discriminator": [
        94,
        6,
        202,
        115,
        255,
        96,
        232,
        183
      ],
      "accounts": [
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "user"
        },
        {
          "name": "user_volume_accumulator",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114,
                  95,
                  118,
                  111,
                  108,
                  117,
                  109,
                  101,
                  95,
                  97,
                  99,
                  99,
                  117,
                  109,
                  117,
                  108,
                  97,
                  116,
                  111,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "user"
              }
            ]
          }
        },
        {
          "name": "system_program",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "event_authority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  95,
                  95,
                  101,
                  118,
                  101,
                  110,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "program"
        }
      ],
      "args": []
    },
    {
      "name": "initialize",
      "docs": [
        "Creates the global state."
      ],
      "discriminator": [
        175,
        175,
        109,
        31,
        13,
        152,
        155,
        237
      ],
      "accounts": [
        {
          "name": "global",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  108,
                  111,
                  98,
                  97,
                  108
                ]
              }
            ]
          }
        },
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "system_program",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "initialize_quote_control",
      "discriminator": [
        239,
        73,
        245,
        173,
        209,
        177,
        84,
        66
      ],
      "accounts": [
        {
          "name": "quote_control",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  113,
                  117,
                  111,
                  116,
                  101,
                  45,
                  99,
                  111,
                  110,
                  116,
                  114,
                  111,
                  108
                ]
              }
            ]
          }
        },
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "system_program",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "migrate",
      "docs": [
        "Migrates liquidity to pump_amm if the bonding curve is complete"
      ],
      "discriminator": [
        155,
        234,
        231,
        146,
        236,
        158,
        162,
        30
      ],
      "accounts": [
        {
          "name": "global",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  108,
                  111,
                  98,
                  97,
                  108
                ]
              }
            ]
          }
        },
        {
          "name": "withdraw_authority",
          "writable": true,
          "relations": [
            "global"
          ]
        },
        {
          "name": "mint"
        },
        {
          "name": "bonding_curve",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  111,
                  110,
                  100,
                  105,
                  110,
                  103,
                  45,
                  99,
                  117,
                  114,
                  118,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        },
        {
          "name": "associated_bonding_curve",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "bonding_curve"
              },
              {
                "kind": "account",
                "path": "mint"
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "system_program",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "token_program",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "pump_amm",
          "address": "pAMMBay6oceH9fJKBRHGP5D4bD4sWpmSwMn52FMfXEA"
        },
        {
          "name": "pool",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  111,
                  111,
                  108
                ]
              },
              {
                "kind": "const",
                "value": [
                  0,
                  0
                ]
              },
              {
                "kind": "account",
                "path": "pool_authority"
              },
              {
                "kind": "account",
                "path": "mint"
              },
              {
                "kind": "account",
                "path": "wsol_mint"
              }
            ],
            "program": {
              "kind": "account",
              "path": "pump_amm"
            }
          }
        },
        {
          "name": "pool_authority",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  111,
                  111,
                  108,
                  45,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        },
        {
          "name": "pool_authority_mint_account",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "pool_authority"
              },
              {
                "kind": "account",
                "path": "mint"
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ],
            "program": {
              "kind": "account",
              "path": "associated_token_program"
            }
          }
        },
        {
          "name": "pool_authority_wsol_account",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "pool_authority"
              },
              {
                "kind": "account",
                "path": "token_program"
              },
              {
                "kind": "account",
                "path": "wsol_mint"
              }
            ],
            "program": {
              "kind": "account",
              "path": "associated_token_program"
            }
          }
        },
        {
          "name": "amm_global_config",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  108,
                  111,
                  98,
                  97,
                  108,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ],
            "program": {
              "kind": "account",
              "path": "pump_amm"
            }
          }
        },
        {
          "name": "wsol_mint",
          "address": "So11111111111111111111111111111111111111112"
        },
        {
          "name": "lp_mint",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  111,
                  111,
                  108,
                  95,
                  108,
                  112,
                  95,
                  109,
                  105,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "pool"
              }
            ],
            "program": {
              "kind": "account",
              "path": "pump_amm"
            }
          }
        },
        {
          "name": "user_pool_token_account",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "pool_authority"
              },
              {
                "kind": "account",
                "path": "token_2022_program"
              },
              {
                "kind": "account",
                "path": "lp_mint"
              }
            ],
            "program": {
              "kind": "account",
              "path": "associated_token_program"
            }
          }
        },
        {
          "name": "pool_base_token_account",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "pool"
              },
              {
                "kind": "account",
                "path": "mint"
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ],
            "program": {
              "kind": "account",
              "path": "associated_token_program"
            }
          }
        },
        {
          "name": "pool_quote_token_account",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "pool"
              },
              {
                "kind": "account",
                "path": "token_program"
              },
              {
                "kind": "account",
                "path": "wsol_mint"
              }
            ],
            "program": {
              "kind": "account",
              "path": "associated_token_program"
            }
          }
        },
        {
          "name": "token_2022_program",
          "address": "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb"
        },
        {
          "name": "associated_token_program",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "pump_amm_event_authority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  95,
                  95,
                  101,
                  118,
                  101,
                  110,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              }
            ],
            "program": {
              "kind": "account",
              "path": "pump_amm"
            }
          }
        },
        {
          "name": "event_authority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  95,
                  95,
                  101,
                  118,
                  101,
                  110,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "program",
          "address": "6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P"
        },
        {
          "name": "rent",
          "address": "SysvarRent111111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "migrate_bonding_curve_creator",
      "discriminator": [
        87,
        124,
        52,
        191,
        52,
        38,
        214,
        232
      ],
      "accounts": [
        {
          "name": "mint",
          "relations": [
            "sharing_config"
          ]
        },
        {
          "name": "bonding_curve",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  111,
                  110,
                  100,
                  105,
                  110,
                  103,
                  45,
                  99,
                  117,
                  114,
                  118,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        },
        {
          "name": "sharing_config",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  104,
                  97,
                  114,
                  105,
                  110,
                  103,
                  45,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                12,
                53,
                255,
                169,
                5,
                90,
                142,
                86,
                141,
                168,
                247,
                188,
                7,
                86,
                21,
                39,
                76,
                241,
                201,
                44,
                164,
                31,
                64,
                0,
                156,
                81,
                106,
                164,
                20,
                194,
                124,
                112
              ]
            }
          }
        },
        {
          "name": "event_authority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  95,
                  95,
                  101,
                  118,
                  101,
                  110,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "program"
        }
      ],
      "args": []
    },
    {
      "name": "migrate_v2",
      "docs": [
        "Migrates liquidity to pump_amm if the bonding curve is complete"
      ],
      "discriminator": [
        187,
        203,
        18,
        31,
        206,
        237,
        254,
        41
      ],
      "accounts": [
        {
          "name": "global",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  108,
                  111,
                  98,
                  97,
                  108
                ]
              }
            ]
          }
        },
        {
          "name": "withdraw_authority",
          "writable": true,
          "relations": [
            "global"
          ]
        },
        {
          "name": "base_mint"
        },
        {
          "name": "quote_mint"
        },
        {
          "name": "bonding_curve",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  111,
                  110,
                  100,
                  105,
                  110,
                  103,
                  45,
                  99,
                  117,
                  114,
                  118,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "base_mint"
              }
            ]
          }
        },
        {
          "name": "associated_base_bonding_curve",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "bonding_curve"
              },
              {
                "kind": "account",
                "path": "base_token_program"
              },
              {
                "kind": "account",
                "path": "base_mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "associated_quote_bonding_curve",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "bonding_curve"
              },
              {
                "kind": "account",
                "path": "quote_token_program"
              },
              {
                "kind": "account",
                "path": "quote_mint"
              }
            ],
            "program": {
              "kind": "account",
              "path": "associated_token_program"
            }
          }
        },
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "system_program",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "pump_amm",
          "address": "pAMMBay6oceH9fJKBRHGP5D4bD4sWpmSwMn52FMfXEA"
        },
        {
          "name": "pool",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  111,
                  111,
                  108
                ]
              },
              {
                "kind": "const",
                "value": [
                  0,
                  0
                ]
              },
              {
                "kind": "account",
                "path": "pool_authority"
              },
              {
                "kind": "account",
                "path": "base_mint"
              },
              {
                "kind": "account",
                "path": "quote_mint"
              }
            ],
            "program": {
              "kind": "account",
              "path": "pump_amm"
            }
          }
        },
        {
          "name": "pool_authority",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  111,
                  111,
                  108,
                  45,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              },
              {
                "kind": "account",
                "path": "base_mint"
              }
            ]
          }
        },
        {
          "name": "pool_authority_mint_account",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "pool_authority"
              },
              {
                "kind": "account",
                "path": "base_token_program"
              },
              {
                "kind": "account",
                "path": "base_mint"
              }
            ],
            "program": {
              "kind": "account",
              "path": "associated_token_program"
            }
          }
        },
        {
          "name": "pool_authority_quote_account",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "pool_authority"
              },
              {
                "kind": "account",
                "path": "quote_token_program"
              },
              {
                "kind": "account",
                "path": "quote_mint"
              }
            ],
            "program": {
              "kind": "account",
              "path": "associated_token_program"
            }
          }
        },
        {
          "name": "amm_global_config",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  108,
                  111,
                  98,
                  97,
                  108,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ],
            "program": {
              "kind": "account",
              "path": "pump_amm"
            }
          }
        },
        {
          "name": "lp_mint",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  111,
                  111,
                  108,
                  95,
                  108,
                  112,
                  95,
                  109,
                  105,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "pool"
              }
            ],
            "program": {
              "kind": "account",
              "path": "pump_amm"
            }
          }
        },
        {
          "name": "user_pool_token_account",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "pool_authority"
              },
              {
                "kind": "account",
                "path": "token_2022_program"
              },
              {
                "kind": "account",
                "path": "lp_mint"
              }
            ],
            "program": {
              "kind": "account",
              "path": "associated_token_program"
            }
          }
        },
        {
          "name": "pool_base_token_account",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "pool"
              },
              {
                "kind": "account",
                "path": "base_token_program"
              },
              {
                "kind": "account",
                "path": "base_mint"
              }
            ],
            "program": {
              "kind": "account",
              "path": "associated_token_program"
            }
          }
        },
        {
          "name": "pool_quote_token_account",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "pool"
              },
              {
                "kind": "account",
                "path": "quote_token_program"
              },
              {
                "kind": "account",
                "path": "quote_mint"
              }
            ],
            "program": {
              "kind": "account",
              "path": "associated_token_program"
            }
          }
        },
        {
          "name": "base_token_program"
        },
        {
          "name": "quote_token_program"
        },
        {
          "name": "token_2022_program",
          "address": "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb"
        },
        {
          "name": "associated_token_program",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "pump_amm_event_authority"
        },
        {
          "name": "rent",
          "address": "SysvarRent111111111111111111111111111111111"
        },
        {
          "name": "event_authority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  95,
                  95,
                  101,
                  118,
                  101,
                  110,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "program"
        }
      ],
      "args": []
    },
    {
      "name": "multi_hop_curve_swap",
      "discriminator": [
        225,
        154,
        117,
        22,
        215,
        86,
        246,
        103
      ],
      "accounts": [
        {
          "name": "global",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  108,
                  111,
                  98,
                  97,
                  108
                ]
              }
            ]
          }
        },
        {
          "name": "fee_config",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  102,
                  101,
                  101,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              },
              {
                "kind": "const",
                "value": [
                  1,
                  86,
                  224,
                  246,
                  147,
                  102,
                  90,
                  207,
                  68,
                  219,
                  21,
                  104,
                  191,
                  23,
                  91,
                  170,
                  81,
                  137,
                  203,
                  151,
                  245,
                  210,
                  255,
                  59,
                  101,
                  93,
                  43,
                  182,
                  253,
                  109,
                  24,
                  176
                ]
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                12,
                53,
                255,
                169,
                5,
                90,
                142,
                86,
                141,
                168,
                247,
                188,
                7,
                86,
                21,
                39,
                76,
                241,
                201,
                44,
                164,
                31,
                64,
                0,
                156,
                81,
                106,
                164,
                20,
                194,
                124,
                112
              ]
            }
          }
        },
        {
          "name": "pump_amm_global_config",
          "signer": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  108,
                  111,
                  98,
                  97,
                  108,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                12,
                20,
                222,
                252,
                130,
                94,
                198,
                118,
                148,
                37,
                8,
                24,
                187,
                101,
                64,
                101,
                244,
                41,
                141,
                49,
                86,
                213,
                113,
                180,
                212,
                248,
                9,
                12,
                24,
                233,
                168,
                99
              ]
            }
          }
        },
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "source_authority",
          "signer": true
        },
        {
          "name": "source",
          "writable": true
        },
        {
          "name": "destination",
          "writable": true
        },
        {
          "name": "buyback_fee_recipient",
          "writable": true
        },
        {
          "name": "token_program",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "token_2022_program",
          "address": "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb"
        },
        {
          "name": "system_program",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "event_authority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  95,
                  95,
                  101,
                  118,
                  101,
                  110,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "program",
          "address": "6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P"
        }
      ],
      "args": [
        {
          "name": "amount_in",
          "type": "u64"
        },
        {
          "name": "hop_fees",
          "type": "bytes"
        }
      ],
      "returns": {
        "defined": {
          "name": "CurveRunResult"
        }
      }
    },
    {
      "name": "remove_quote_control_mint",
      "discriminator": [
        223,
        7,
        253,
        26,
        81,
        165,
        218,
        166
      ],
      "accounts": [
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "global",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  108,
                  111,
                  98,
                  97,
                  108
                ]
              }
            ]
          }
        },
        {
          "name": "quote_control",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  113,
                  117,
                  111,
                  116,
                  101,
                  45,
                  99,
                  111,
                  110,
                  116,
                  114,
                  111,
                  108
                ]
              }
            ]
          }
        },
        {
          "name": "system_program",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "event_authority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  95,
                  95,
                  101,
                  118,
                  101,
                  110,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "program"
        }
      ],
      "args": [
        {
          "name": "quote_mint",
          "type": "pubkey"
        }
      ]
    },
    {
      "name": "remove_quote_mint",
      "discriminator": [
        177,
        65,
        223,
        38,
        88,
        209,
        158,
        155
      ],
      "accounts": [
        {
          "name": "global",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  108,
                  111,
                  98,
                  97,
                  108
                ]
              }
            ]
          }
        },
        {
          "name": "authority",
          "writable": true,
          "signer": true,
          "relations": [
            "global"
          ]
        },
        {
          "name": "event_authority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  95,
                  95,
                  101,
                  118,
                  101,
                  110,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "program"
        }
      ],
      "args": [
        {
          "name": "quote_mint",
          "type": "pubkey"
        }
      ]
    },
    {
      "name": "sell",
      "docs": [
        "Sells tokens into a bonding curve.",
        "For cashback coins, pass as remaining_accounts: [0] user_volume_accumulator,",
        "[1] bonding_curve_v2. If provided and valid, creator_fee goes to user_volume_accumulator.",
        "Otherwise, falls back to transferring creator_fee to creator_vault."
      ],
      "discriminator": [
        51,
        230,
        133,
        164,
        1,
        127,
        131,
        173
      ],
      "accounts": [
        {
          "name": "global",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  108,
                  111,
                  98,
                  97,
                  108
                ]
              }
            ]
          }
        },
        {
          "name": "fee_recipient",
          "writable": true
        },
        {
          "name": "mint"
        },
        {
          "name": "bonding_curve",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  111,
                  110,
                  100,
                  105,
                  110,
                  103,
                  45,
                  99,
                  117,
                  114,
                  118,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        },
        {
          "name": "associated_bonding_curve",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "bonding_curve"
              },
              {
                "kind": "account",
                "path": "token_program"
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "associated_user",
          "writable": true
        },
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "system_program",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "creator_vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  114,
                  101,
                  97,
                  116,
                  111,
                  114,
                  45,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "bonding_curve.creator",
                "account": "BondingCurve"
              }
            ]
          }
        },
        {
          "name": "token_program"
        },
        {
          "name": "event_authority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  95,
                  95,
                  101,
                  118,
                  101,
                  110,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "program",
          "address": "6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P"
        },
        {
          "name": "fee_config",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  102,
                  101,
                  101,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              },
              {
                "kind": "const",
                "value": [
                  1,
                  86,
                  224,
                  246,
                  147,
                  102,
                  90,
                  207,
                  68,
                  219,
                  21,
                  104,
                  191,
                  23,
                  91,
                  170,
                  81,
                  137,
                  203,
                  151,
                  245,
                  210,
                  255,
                  59,
                  101,
                  93,
                  43,
                  182,
                  253,
                  109,
                  24,
                  176
                ]
              }
            ],
            "program": {
              "kind": "account",
              "path": "fee_program"
            }
          }
        },
        {
          "name": "fee_program",
          "address": "pfeeUxB6jkeY1Hxd7CsFCAjcbHA9rWtchMGdZ6VojVZ"
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        },
        {
          "name": "min_sol_output",
          "type": "u64"
        }
      ]
    },
    {
      "name": "sell_v2",
      "discriminator": [
        93,
        246,
        130,
        60,
        231,
        233,
        64,
        178
      ],
      "accounts": [
        {
          "name": "global",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  108,
                  111,
                  98,
                  97,
                  108
                ]
              }
            ]
          }
        },
        {
          "name": "base_mint"
        },
        {
          "name": "quote_mint"
        },
        {
          "name": "base_token_program"
        },
        {
          "name": "quote_token_program"
        },
        {
          "name": "associated_token_program",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "fee_recipient",
          "writable": true
        },
        {
          "name": "associated_quote_fee_recipient",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "fee_recipient"
              },
              {
                "kind": "account",
                "path": "quote_token_program"
              },
              {
                "kind": "account",
                "path": "quote_mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "buyback_fee_recipient",
          "writable": true
        },
        {
          "name": "associated_quote_buyback_fee_recipient",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "buyback_fee_recipient"
              },
              {
                "kind": "account",
                "path": "quote_token_program"
              },
              {
                "kind": "account",
                "path": "quote_mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "bonding_curve",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  111,
                  110,
                  100,
                  105,
                  110,
                  103,
                  45,
                  99,
                  117,
                  114,
                  118,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "base_mint"
              }
            ]
          }
        },
        {
          "name": "associated_base_bonding_curve",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "bonding_curve"
              },
              {
                "kind": "account",
                "path": "base_token_program"
              },
              {
                "kind": "account",
                "path": "base_mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "associated_quote_bonding_curve",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "bonding_curve"
              },
              {
                "kind": "account",
                "path": "quote_token_program"
              },
              {
                "kind": "account",
                "path": "quote_mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "associated_base_user",
          "writable": true
        },
        {
          "name": "associated_quote_user",
          "docs": [
            "canonical SPL associated-token PDA. Validated in `sell_v2_ix` via",
            "`validate_user_quote_token_account` for non-legacy mints; ignored for legacy (SOL) trades."
          ],
          "writable": true
        },
        {
          "name": "creator_vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  114,
                  101,
                  97,
                  116,
                  111,
                  114,
                  45,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "bonding_curve.creator",
                "account": "BondingCurve"
              }
            ]
          }
        },
        {
          "name": "associated_creator_vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "creator_vault"
              },
              {
                "kind": "account",
                "path": "quote_token_program"
              },
              {
                "kind": "account",
                "path": "quote_mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "sharing_config",
          "docs": [
            "seeds; the account is intentionally not deserialized here because it may be uninitialized",
            "for mints that have not created a fee sharing config. Handlers must check",
            "`data_is_empty()` / owner before reading."
          ],
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  104,
                  97,
                  114,
                  105,
                  110,
                  103,
                  45,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              },
              {
                "kind": "account",
                "path": "base_mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                12,
                53,
                255,
                169,
                5,
                90,
                142,
                86,
                141,
                168,
                247,
                188,
                7,
                86,
                21,
                39,
                76,
                241,
                201,
                44,
                164,
                31,
                64,
                0,
                156,
                81,
                106,
                164,
                20,
                194,
                124,
                112
              ]
            }
          }
        },
        {
          "name": "user_volume_accumulator",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114,
                  95,
                  118,
                  111,
                  108,
                  117,
                  109,
                  101,
                  95,
                  97,
                  99,
                  99,
                  117,
                  109,
                  117,
                  108,
                  97,
                  116,
                  111,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "user"
              }
            ]
          }
        },
        {
          "name": "associated_user_volume_accumulator",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "user_volume_accumulator"
              },
              {
                "kind": "account",
                "path": "quote_token_program"
              },
              {
                "kind": "account",
                "path": "quote_mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "fee_config",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  102,
                  101,
                  101,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              },
              {
                "kind": "const",
                "value": [
                  1,
                  86,
                  224,
                  246,
                  147,
                  102,
                  90,
                  207,
                  68,
                  219,
                  21,
                  104,
                  191,
                  23,
                  91,
                  170,
                  81,
                  137,
                  203,
                  151,
                  245,
                  210,
                  255,
                  59,
                  101,
                  93,
                  43,
                  182,
                  253,
                  109,
                  24,
                  176
                ]
              }
            ],
            "program": {
              "kind": "account",
              "path": "fee_program"
            }
          }
        },
        {
          "name": "fee_program",
          "address": "pfeeUxB6jkeY1Hxd7CsFCAjcbHA9rWtchMGdZ6VojVZ"
        },
        {
          "name": "system_program",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "event_authority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  95,
                  95,
                  101,
                  118,
                  101,
                  110,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "program",
          "address": "6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P"
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        },
        {
          "name": "min_sol_output",
          "type": "u64"
        }
      ]
    },
    {
      "name": "sell_v3",
      "discriminator": [
        28,
        146,
        222,
        119,
        38,
        196,
        105,
        213
      ],
      "accounts": [
        {
          "name": "global",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  108,
                  111,
                  98,
                  97,
                  108
                ]
              }
            ]
          }
        },
        {
          "name": "base_mint"
        },
        {
          "name": "quote_mint"
        },
        {
          "name": "base_token_program"
        },
        {
          "name": "quote_token_program"
        },
        {
          "name": "bonding_curve",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  111,
                  110,
                  100,
                  105,
                  110,
                  103,
                  45,
                  99,
                  117,
                  114,
                  118,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "base_mint"
              }
            ]
          }
        },
        {
          "name": "associated_base_bonding_curve",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "bonding_curve"
              },
              {
                "kind": "account",
                "path": "base_token_program"
              },
              {
                "kind": "account",
                "path": "base_mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "associated_quote_bonding_curve",
          "docs": [
            "Must already exist on a token quote (create_v2 creates it); ignored on a SOL quote."
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "bonding_curve"
              },
              {
                "kind": "account",
                "path": "quote_token_program"
              },
              {
                "kind": "account",
                "path": "quote_mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "associated_base_user",
          "writable": true
        },
        {
          "name": "associated_quote_user",
          "docs": [
            "canonical SPL associated-token PDA. Validated in the handlers via",
            "`validate_user_quote_token_account` for non-legacy mints; ignored for legacy (SOL) trades."
          ],
          "writable": true
        },
        {
          "name": "user_volume_accumulator",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114,
                  95,
                  118,
                  111,
                  108,
                  117,
                  109,
                  101,
                  95,
                  97,
                  99,
                  99,
                  117,
                  109,
                  117,
                  108,
                  97,
                  116,
                  111,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "user"
              }
            ]
          }
        },
        {
          "name": "fee_config",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  102,
                  101,
                  101,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              },
              {
                "kind": "const",
                "value": [
                  1,
                  86,
                  224,
                  246,
                  147,
                  102,
                  90,
                  207,
                  68,
                  219,
                  21,
                  104,
                  191,
                  23,
                  91,
                  170,
                  81,
                  137,
                  203,
                  151,
                  245,
                  210,
                  255,
                  59,
                  101,
                  93,
                  43,
                  182,
                  253,
                  109,
                  24,
                  176
                ]
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                12,
                53,
                255,
                169,
                5,
                90,
                142,
                86,
                141,
                168,
                247,
                188,
                7,
                86,
                21,
                39,
                76,
                241,
                201,
                44,
                164,
                31,
                64,
                0,
                156,
                81,
                106,
                164,
                20,
                194,
                124,
                112
              ]
            }
          }
        },
        {
          "name": "buyback_fee_recipient",
          "writable": true
        },
        {
          "name": "system_program",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "event_authority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  95,
                  95,
                  101,
                  118,
                  101,
                  110,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "program",
          "address": "6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P"
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        },
        {
          "name": "min_sol_output",
          "type": "u64"
        }
      ]
    },
    {
      "name": "set_creator",
      "docs": [
        "Allows Global::set_creator_authority to set the bonding curve creator from Metaplex metadata or input argument"
      ],
      "discriminator": [
        254,
        148,
        255,
        112,
        207,
        142,
        170,
        165
      ],
      "accounts": [
        {
          "name": "set_creator_authority",
          "signer": true,
          "relations": [
            "global"
          ]
        },
        {
          "name": "global",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  108,
                  111,
                  98,
                  97,
                  108
                ]
              }
            ]
          }
        },
        {
          "name": "mint"
        },
        {
          "name": "metadata",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  101,
                  116,
                  97,
                  100,
                  97,
                  116,
                  97
                ]
              },
              {
                "kind": "const",
                "value": [
                  11,
                  112,
                  101,
                  177,
                  227,
                  209,
                  124,
                  69,
                  56,
                  157,
                  82,
                  127,
                  107,
                  4,
                  195,
                  205,
                  88,
                  184,
                  108,
                  115,
                  26,
                  160,
                  253,
                  181,
                  73,
                  182,
                  209,
                  188,
                  3,
                  248,
                  41,
                  70
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                11,
                112,
                101,
                177,
                227,
                209,
                124,
                69,
                56,
                157,
                82,
                127,
                107,
                4,
                195,
                205,
                88,
                184,
                108,
                115,
                26,
                160,
                253,
                181,
                73,
                182,
                209,
                188,
                3,
                248,
                41,
                70
              ]
            }
          }
        },
        {
          "name": "bonding_curve",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  111,
                  110,
                  100,
                  105,
                  110,
                  103,
                  45,
                  99,
                  117,
                  114,
                  118,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        },
        {
          "name": "event_authority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  95,
                  95,
                  101,
                  118,
                  101,
                  110,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "program"
        }
      ],
      "args": [
        {
          "name": "creator",
          "type": "pubkey"
        }
      ]
    },
    {
      "name": "set_max_curve_depth",
      "discriminator": [
        32,
        154,
        152,
        219,
        142,
        108,
        218,
        165
      ],
      "accounts": [
        {
          "name": "global",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  108,
                  111,
                  98,
                  97,
                  108
                ]
              }
            ]
          }
        },
        {
          "name": "authority",
          "writable": true,
          "signer": true,
          "relations": [
            "global"
          ]
        },
        {
          "name": "event_authority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  95,
                  95,
                  101,
                  118,
                  101,
                  110,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "program"
        }
      ],
      "args": [
        {
          "name": "max_curve_depth",
          "type": "u8"
        }
      ]
    },
    {
      "name": "set_mayhem_virtual_params",
      "discriminator": [
        61,
        169,
        188,
        191,
        153,
        149,
        42,
        97
      ],
      "accounts": [
        {
          "name": "sol_vault_authority",
          "writable": true,
          "signer": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  111,
                  108,
                  45,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                5,
                42,
                229,
                215,
                167,
                218,
                167,
                36,
                166,
                234,
                176,
                167,
                41,
                84,
                145,
                133,
                90,
                212,
                160,
                103,
                22,
                96,
                103,
                76,
                78,
                3,
                69,
                89,
                128,
                61,
                101,
                163
              ]
            }
          }
        },
        {
          "name": "mayhem_token_vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "sol_vault_authority"
              },
              {
                "kind": "account",
                "path": "token_program"
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "mint"
        },
        {
          "name": "global",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  108,
                  111,
                  98,
                  97,
                  108
                ]
              }
            ]
          }
        },
        {
          "name": "bonding_curve",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  111,
                  110,
                  100,
                  105,
                  110,
                  103,
                  45,
                  99,
                  117,
                  114,
                  118,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        },
        {
          "name": "token_program",
          "address": "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb"
        },
        {
          "name": "event_authority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  95,
                  95,
                  101,
                  118,
                  101,
                  110,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "program"
        }
      ],
      "args": []
    },
    {
      "name": "set_metaplex_creator",
      "docs": [
        "Syncs the bonding curve creator with the Metaplex metadata creator if it exists"
      ],
      "discriminator": [
        138,
        96,
        174,
        217,
        48,
        85,
        197,
        246
      ],
      "accounts": [
        {
          "name": "mint"
        },
        {
          "name": "metadata",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  101,
                  116,
                  97,
                  100,
                  97,
                  116,
                  97
                ]
              },
              {
                "kind": "const",
                "value": [
                  11,
                  112,
                  101,
                  177,
                  227,
                  209,
                  124,
                  69,
                  56,
                  157,
                  82,
                  127,
                  107,
                  4,
                  195,
                  205,
                  88,
                  184,
                  108,
                  115,
                  26,
                  160,
                  253,
                  181,
                  73,
                  182,
                  209,
                  188,
                  3,
                  248,
                  41,
                  70
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                11,
                112,
                101,
                177,
                227,
                209,
                124,
                69,
                56,
                157,
                82,
                127,
                107,
                4,
                195,
                205,
                88,
                184,
                108,
                115,
                26,
                160,
                253,
                181,
                73,
                182,
                209,
                188,
                3,
                248,
                41,
                70
              ]
            }
          }
        },
        {
          "name": "bonding_curve",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  111,
                  110,
                  100,
                  105,
                  110,
                  103,
                  45,
                  99,
                  117,
                  114,
                  118,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        },
        {
          "name": "event_authority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  95,
                  95,
                  101,
                  118,
                  101,
                  110,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "program"
        }
      ],
      "args": []
    },
    {
      "name": "set_params",
      "docs": [
        "Sets the global state parameters."
      ],
      "discriminator": [
        27,
        234,
        178,
        52,
        147,
        2,
        187,
        141
      ],
      "accounts": [
        {
          "name": "global",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  108,
                  111,
                  98,
                  97,
                  108
                ]
              }
            ]
          }
        },
        {
          "name": "authority",
          "writable": true,
          "signer": true,
          "relations": [
            "global"
          ]
        },
        {
          "name": "event_authority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  95,
                  95,
                  101,
                  118,
                  101,
                  110,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "program"
        }
      ],
      "args": [
        {
          "name": "initial_virtual_token_reserves",
          "type": "u64"
        },
        {
          "name": "initial_virtual_sol_reserves",
          "type": "u64"
        },
        {
          "name": "initial_real_token_reserves",
          "type": "u64"
        },
        {
          "name": "token_total_supply",
          "type": "u64"
        },
        {
          "name": "fee_basis_points",
          "type": "u64"
        },
        {
          "name": "withdraw_authority",
          "type": "pubkey"
        },
        {
          "name": "enable_migrate",
          "type": "bool"
        },
        {
          "name": "pool_migration_fee",
          "type": "u64"
        },
        {
          "name": "creator_fee_basis_points",
          "type": "u64"
        },
        {
          "name": "set_creator_authority",
          "type": "pubkey"
        },
        {
          "name": "admin_set_creator_authority",
          "type": "pubkey"
        }
      ]
    },
    {
      "name": "set_quote_control_admin",
      "discriminator": [
        62,
        79,
        161,
        211,
        165,
        170,
        214,
        210
      ],
      "accounts": [
        {
          "name": "global",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  108,
                  111,
                  98,
                  97,
                  108
                ]
              }
            ]
          }
        },
        {
          "name": "authority",
          "signer": true,
          "relations": [
            "global"
          ]
        },
        {
          "name": "quote_control",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  113,
                  117,
                  111,
                  116,
                  101,
                  45,
                  99,
                  111,
                  110,
                  116,
                  114,
                  111,
                  108
                ]
              }
            ]
          }
        },
        {
          "name": "event_authority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  95,
                  95,
                  101,
                  118,
                  101,
                  110,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "program"
        }
      ],
      "args": [
        {
          "name": "new_admin",
          "type": "pubkey"
        }
      ]
    },
    {
      "name": "set_quote_control_mint_reserves",
      "discriminator": [
        116,
        220,
        107,
        83,
        191,
        44,
        32,
        73
      ],
      "accounts": [
        {
          "name": "authority",
          "signer": true
        },
        {
          "name": "global",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  108,
                  111,
                  98,
                  97,
                  108
                ]
              }
            ]
          }
        },
        {
          "name": "quote_control",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  113,
                  117,
                  111,
                  116,
                  101,
                  45,
                  99,
                  111,
                  110,
                  116,
                  114,
                  111,
                  108
                ]
              }
            ]
          }
        },
        {
          "name": "event_authority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  95,
                  95,
                  101,
                  118,
                  101,
                  110,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "program"
        }
      ],
      "args": [
        {
          "name": "quote_mint",
          "type": "pubkey"
        },
        {
          "name": "initial_virtual_quote_reserves",
          "type": "u64"
        }
      ]
    },
    {
      "name": "set_quote_control_reserves_admin",
      "discriminator": [
        161,
        195,
        222,
        165,
        225,
        101,
        192,
        62
      ],
      "accounts": [
        {
          "name": "authority",
          "signer": true
        },
        {
          "name": "global",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  108,
                  111,
                  98,
                  97,
                  108
                ]
              }
            ]
          }
        },
        {
          "name": "quote_control",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  113,
                  117,
                  111,
                  116,
                  101,
                  45,
                  99,
                  111,
                  110,
                  116,
                  114,
                  111,
                  108
                ]
              }
            ]
          }
        },
        {
          "name": "event_authority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  95,
                  95,
                  101,
                  118,
                  101,
                  110,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "program"
        }
      ],
      "args": [
        {
          "name": "new_reserves_admin",
          "type": "pubkey"
        }
      ]
    },
    {
      "name": "set_reserved_fee_recipients",
      "discriminator": [
        111,
        172,
        162,
        232,
        114,
        89,
        213,
        142
      ],
      "accounts": [
        {
          "name": "global",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  108,
                  111,
                  98,
                  97,
                  108
                ]
              }
            ]
          }
        },
        {
          "name": "authority",
          "signer": true,
          "relations": [
            "global"
          ]
        },
        {
          "name": "event_authority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  95,
                  95,
                  101,
                  118,
                  101,
                  110,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "program"
        }
      ],
      "args": [
        {
          "name": "whitelist_pda",
          "type": "pubkey"
        }
      ]
    },
    {
      "name": "set_virtual_quote_reserves",
      "discriminator": [
        101,
        135,
        191,
        104,
        9,
        88,
        20,
        96
      ],
      "accounts": [
        {
          "name": "global",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  108,
                  111,
                  98,
                  97,
                  108
                ]
              }
            ]
          }
        },
        {
          "name": "authority",
          "writable": true,
          "signer": true,
          "relations": [
            "global"
          ]
        },
        {
          "name": "event_authority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  95,
                  95,
                  101,
                  118,
                  101,
                  110,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "program"
        }
      ],
      "args": [
        {
          "name": "initial_virtual_quote_reserves",
          "type": "u64"
        }
      ]
    },
    {
      "name": "sweep_creator_fee",
      "discriminator": [
        32,
        246,
        191,
        52,
        8,
        201,
        73,
        186
      ],
      "accounts": [
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "global",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  108,
                  111,
                  98,
                  97,
                  108
                ]
              }
            ]
          }
        },
        {
          "name": "base_mint"
        },
        {
          "name": "quote_mint"
        },
        {
          "name": "quote_token_program"
        },
        {
          "name": "associated_token_program",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "system_program",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "bonding_curve",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  111,
                  110,
                  100,
                  105,
                  110,
                  103,
                  45,
                  99,
                  117,
                  114,
                  118,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "base_mint"
              }
            ]
          }
        },
        {
          "name": "associated_quote_bonding_curve",
          "docs": [
            "the source on a token quote, ignored on a SOL quote."
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "bonding_curve"
              },
              {
                "kind": "account",
                "path": "quote_token_program"
              },
              {
                "kind": "account",
                "path": "quote_mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "recipient",
          "docs": [
            "recipient (`check_fee_recipient`) or the creator vault PDA of `bonding_curve.creator`."
          ],
          "writable": true
        },
        {
          "name": "associated_quote_recipient",
          "docs": [
            "created idempotently on a token quote, ignored on a SOL quote."
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "recipient"
              },
              {
                "kind": "account",
                "path": "quote_token_program"
              },
              {
                "kind": "account",
                "path": "quote_mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "event_authority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  95,
                  95,
                  101,
                  118,
                  101,
                  110,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "program"
        }
      ],
      "args": []
    },
    {
      "name": "sweep_protocol_fee",
      "discriminator": [
        8,
        48,
        190,
        7,
        182,
        68,
        183,
        229
      ],
      "accounts": [
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "global",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  108,
                  111,
                  98,
                  97,
                  108
                ]
              }
            ]
          }
        },
        {
          "name": "base_mint"
        },
        {
          "name": "quote_mint"
        },
        {
          "name": "quote_token_program"
        },
        {
          "name": "associated_token_program",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "system_program",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "bonding_curve",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  111,
                  110,
                  100,
                  105,
                  110,
                  103,
                  45,
                  99,
                  117,
                  114,
                  118,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "base_mint"
              }
            ]
          }
        },
        {
          "name": "associated_quote_bonding_curve",
          "docs": [
            "the source on a token quote, ignored on a SOL quote."
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "bonding_curve"
              },
              {
                "kind": "account",
                "path": "quote_token_program"
              },
              {
                "kind": "account",
                "path": "quote_mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "recipient",
          "docs": [
            "recipient (`check_fee_recipient`) or the creator vault PDA of `bonding_curve.creator`."
          ],
          "writable": true
        },
        {
          "name": "associated_quote_recipient",
          "docs": [
            "created idempotently on a token quote, ignored on a SOL quote."
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "recipient"
              },
              {
                "kind": "account",
                "path": "quote_token_program"
              },
              {
                "kind": "account",
                "path": "quote_mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "event_authority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  95,
                  95,
                  101,
                  118,
                  101,
                  110,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "program"
        }
      ],
      "args": []
    },
    {
      "name": "sync_user_volume_accumulator",
      "discriminator": [
        86,
        31,
        192,
        87,
        163,
        87,
        79,
        238
      ],
      "accounts": [
        {
          "name": "user"
        },
        {
          "name": "global_volume_accumulator",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  108,
                  111,
                  98,
                  97,
                  108,
                  95,
                  118,
                  111,
                  108,
                  117,
                  109,
                  101,
                  95,
                  97,
                  99,
                  99,
                  117,
                  109,
                  117,
                  108,
                  97,
                  116,
                  111,
                  114
                ]
              }
            ]
          }
        },
        {
          "name": "user_volume_accumulator",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114,
                  95,
                  118,
                  111,
                  108,
                  117,
                  109,
                  101,
                  95,
                  97,
                  99,
                  99,
                  117,
                  109,
                  117,
                  108,
                  97,
                  116,
                  111,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "user"
              }
            ]
          }
        },
        {
          "name": "event_authority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  95,
                  95,
                  101,
                  118,
                  101,
                  110,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "program"
        }
      ],
      "args": []
    },
    {
      "name": "toggle_cashback_enabled",
      "discriminator": [
        115,
        103,
        224,
        255,
        189,
        89,
        86,
        195
      ],
      "accounts": [
        {
          "name": "global",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  108,
                  111,
                  98,
                  97,
                  108
                ]
              }
            ]
          }
        },
        {
          "name": "authority",
          "writable": true,
          "signer": true,
          "relations": [
            "global"
          ]
        },
        {
          "name": "event_authority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  95,
                  95,
                  101,
                  118,
                  101,
                  110,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "program"
        }
      ],
      "args": [
        {
          "name": "enabled",
          "type": "bool"
        }
      ]
    },
    {
      "name": "toggle_create_v2",
      "discriminator": [
        28,
        255,
        230,
        240,
        172,
        107,
        203,
        171
      ],
      "accounts": [
        {
          "name": "global",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  108,
                  111,
                  98,
                  97,
                  108
                ]
              }
            ]
          }
        },
        {
          "name": "authority",
          "writable": true,
          "signer": true,
          "relations": [
            "global"
          ]
        },
        {
          "name": "event_authority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  95,
                  95,
                  101,
                  118,
                  101,
                  110,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "program"
        }
      ],
      "args": [
        {
          "name": "enabled",
          "type": "bool"
        }
      ]
    },
    {
      "name": "toggle_mayhem_mode",
      "discriminator": [
        1,
        9,
        111,
        208,
        100,
        31,
        255,
        163
      ],
      "accounts": [
        {
          "name": "global",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  108,
                  111,
                  98,
                  97,
                  108
                ]
              }
            ]
          }
        },
        {
          "name": "authority",
          "writable": true,
          "signer": true,
          "relations": [
            "global"
          ]
        },
        {
          "name": "event_authority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  95,
                  95,
                  101,
                  118,
                  101,
                  110,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "program"
        }
      ],
      "args": [
        {
          "name": "enabled",
          "type": "bool"
        }
      ]
    },
    {
      "name": "update_buyback_config",
      "discriminator": [
        251,
        224,
        171,
        146,
        160,
        26,
        113,
        233
      ],
      "accounts": [
        {
          "name": "global",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  108,
                  111,
                  98,
                  97,
                  108
                ]
              }
            ]
          }
        },
        {
          "name": "authority",
          "writable": true,
          "signer": true,
          "relations": [
            "global"
          ]
        },
        {
          "name": "event_authority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  95,
                  95,
                  101,
                  118,
                  101,
                  110,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "program"
        }
      ],
      "args": [
        {
          "name": "buyback_basis_points",
          "type": {
            "option": "u64"
          }
        }
      ]
    },
    {
      "name": "update_creator_fee_config",
      "discriminator": [
        61,
        175,
        160,
        249,
        66,
        66,
        136,
        175
      ],
      "accounts": [
        {
          "name": "global",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  108,
                  111,
                  98,
                  97,
                  108
                ]
              }
            ]
          }
        },
        {
          "name": "authority",
          "writable": true,
          "signer": true,
          "relations": [
            "global"
          ]
        },
        {
          "name": "event_authority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  95,
                  95,
                  101,
                  118,
                  101,
                  110,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "program"
        }
      ],
      "args": [
        {
          "name": "creator_fee_configurable",
          "type": "bool"
        },
        {
          "name": "max_configurable_creator_fee_bps",
          "type": "u64"
        }
      ]
    },
    {
      "name": "update_global_authority",
      "discriminator": [
        227,
        181,
        74,
        196,
        208,
        21,
        97,
        213
      ],
      "accounts": [
        {
          "name": "global",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  108,
                  111,
                  98,
                  97,
                  108
                ]
              }
            ]
          }
        },
        {
          "name": "authority",
          "signer": true,
          "relations": [
            "global"
          ]
        },
        {
          "name": "new_authority"
        },
        {
          "name": "event_authority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  95,
                  95,
                  101,
                  118,
                  101,
                  110,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "program"
        }
      ],
      "args": []
    },
    {
      "name": "update_holder_reward_config",
      "discriminator": [
        225,
        252,
        66,
        4,
        199,
        35,
        236,
        16
      ],
      "accounts": [
        {
          "name": "global",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  108,
                  111,
                  98,
                  97,
                  108
                ]
              }
            ]
          }
        },
        {
          "name": "authority",
          "writable": true,
          "signer": true,
          "relations": [
            "global"
          ]
        },
        {
          "name": "event_authority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  95,
                  95,
                  101,
                  118,
                  101,
                  110,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "program"
        }
      ],
      "args": [
        {
          "name": "is_holder_reward_enabled",
          "type": "bool"
        },
        {
          "name": "holder_reward_claim_authority",
          "type": "pubkey"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "BondingCurve",
      "discriminator": [
        23,
        183,
        248,
        55,
        96,
        216,
        172,
        96
      ]
    },
    {
      "name": "FeeConfig",
      "discriminator": [
        143,
        52,
        146,
        187,
        219,
        123,
        76,
        155
      ]
    },
    {
      "name": "Global",
      "discriminator": [
        167,
        232,
        232,
        177,
        200,
        108,
        114,
        127
      ]
    },
    {
      "name": "GlobalVolumeAccumulator",
      "discriminator": [
        202,
        42,
        246,
        43,
        142,
        190,
        30,
        255
      ]
    },
    {
      "name": "QuoteControl",
      "discriminator": [
        56,
        244,
        35,
        238,
        193,
        213,
        162,
        201
      ]
    },
    {
      "name": "SharingConfig",
      "discriminator": [
        216,
        74,
        9,
        0,
        56,
        140,
        93,
        75
      ]
    },
    {
      "name": "UserVolumeAccumulator",
      "discriminator": [
        86,
        255,
        112,
        14,
        102,
        53,
        154,
        250
      ]
    }
  ],
  "events": [
    {
      "name": "AddQuoteControlMintEvent",
      "discriminator": [
        164,
        175,
        87,
        74,
        88,
        45,
        33,
        62
      ]
    },
    {
      "name": "AdminCtoEvent",
      "discriminator": [
        110,
        124,
        226,
        98,
        170,
        255,
        17,
        120
      ]
    },
    {
      "name": "AdminSetIdlAuthorityEvent",
      "discriminator": [
        245,
        59,
        70,
        34,
        75,
        185,
        109,
        92
      ]
    },
    {
      "name": "AdminUpdateTokenIncentivesEvent",
      "discriminator": [
        147,
        250,
        108,
        120,
        247,
        29,
        67,
        222
      ]
    },
    {
      "name": "ClaimCashbackEvent",
      "discriminator": [
        226,
        214,
        246,
        33,
        7,
        242,
        147,
        229
      ]
    },
    {
      "name": "ClaimTokenIncentivesEvent",
      "discriminator": [
        79,
        172,
        246,
        49,
        205,
        91,
        206,
        232
      ]
    },
    {
      "name": "CloseUserVolumeAccumulatorEvent",
      "discriminator": [
        146,
        159,
        189,
        172,
        146,
        88,
        56,
        244
      ]
    },
    {
      "name": "CollectCreatorFeeEvent",
      "discriminator": [
        122,
        2,
        127,
        1,
        14,
        191,
        12,
        175
      ]
    },
    {
      "name": "CompleteEvent",
      "discriminator": [
        95,
        114,
        97,
        156,
        212,
        46,
        152,
        8
      ]
    },
    {
      "name": "CompletePumpAmmMigrationEvent",
      "discriminator": [
        189,
        233,
        93,
        185,
        92,
        148,
        234,
        148
      ]
    },
    {
      "name": "CreateEvent",
      "discriminator": [
        27,
        114,
        169,
        77,
        222,
        235,
        99,
        118
      ]
    },
    {
      "name": "DistributeCreatorFeesEvent",
      "discriminator": [
        165,
        55,
        129,
        112,
        4,
        179,
        202,
        40
      ]
    },
    {
      "name": "DistributeFeeToHoldersEvent",
      "discriminator": [
        227,
        190,
        215,
        206,
        176,
        180,
        165,
        132
      ]
    },
    {
      "name": "ExtendAccountEvent",
      "discriminator": [
        97,
        97,
        215,
        144,
        93,
        146,
        22,
        124
      ]
    },
    {
      "name": "InitUserVolumeAccumulatorEvent",
      "discriminator": [
        134,
        36,
        13,
        72,
        232,
        101,
        130,
        216
      ]
    },
    {
      "name": "MigrateBondingCurveCreatorEvent",
      "discriminator": [
        155,
        167,
        104,
        220,
        213,
        108,
        243,
        3
      ]
    },
    {
      "name": "MinimumDistributableFeeEvent",
      "discriminator": [
        168,
        216,
        132,
        239,
        235,
        182,
        49,
        52
      ]
    },
    {
      "name": "PostCompleteBuyEvent",
      "discriminator": [
        111,
        176,
        109,
        139,
        49,
        108,
        213,
        251
      ]
    },
    {
      "name": "RemoveQuoteControlMintEvent",
      "discriminator": [
        46,
        33,
        86,
        134,
        0,
        213,
        209,
        48
      ]
    },
    {
      "name": "ReservedFeeRecipientsEvent",
      "discriminator": [
        43,
        188,
        250,
        18,
        221,
        75,
        187,
        95
      ]
    },
    {
      "name": "SetCreatorEvent",
      "discriminator": [
        237,
        52,
        123,
        37,
        245,
        251,
        72,
        210
      ]
    },
    {
      "name": "SetMetaplexCreatorEvent",
      "discriminator": [
        142,
        203,
        6,
        32,
        127,
        105,
        191,
        162
      ]
    },
    {
      "name": "SetParamsEvent",
      "discriminator": [
        223,
        195,
        159,
        246,
        62,
        48,
        143,
        131
      ]
    },
    {
      "name": "SetQuoteControlAdminEvent",
      "discriminator": [
        74,
        248,
        141,
        69,
        202,
        81,
        30,
        247
      ]
    },
    {
      "name": "SetQuoteControlMintReservesEvent",
      "discriminator": [
        169,
        67,
        39,
        109,
        102,
        134,
        182,
        232
      ]
    },
    {
      "name": "SetQuoteControlReservesAdminEvent",
      "discriminator": [
        67,
        251,
        179,
        182,
        87,
        92,
        169,
        33
      ]
    },
    {
      "name": "SweepBondingCurveFeeEvent",
      "discriminator": [
        116,
        43,
        77,
        189,
        17,
        122,
        72,
        43
      ]
    },
    {
      "name": "SyncUserVolumeAccumulatorEvent",
      "discriminator": [
        197,
        122,
        167,
        124,
        116,
        81,
        91,
        255
      ]
    },
    {
      "name": "TradeEvent",
      "discriminator": [
        189,
        219,
        127,
        211,
        78,
        230,
        97,
        238
      ]
    },
    {
      "name": "UpdateCreatorFeeConfigEvent",
      "discriminator": [
        152,
        198,
        124,
        124,
        106,
        246,
        127,
        191
      ]
    },
    {
      "name": "UpdateGlobalAuthorityEvent",
      "discriminator": [
        182,
        195,
        137,
        42,
        35,
        206,
        207,
        247
      ]
    },
    {
      "name": "UpdateMayhemVirtualParamsEvent",
      "discriminator": [
        117,
        123,
        228,
        182,
        161,
        168,
        220,
        214
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "NotAuthorized",
      "msg": "The given account is not authorized to execute this instruction."
    },
    {
      "code": 6001,
      "name": "AlreadyInitialized",
      "msg": "The program is already initialized."
    },
    {
      "code": 6002,
      "name": "TooMuchSolRequired",
      "msg": "slippage: Too much SOL required to buy the given amount of tokens."
    },
    {
      "code": 6003,
      "name": "TooLittleSolReceived",
      "msg": "slippage: Too little SOL received to sell the given amount of tokens."
    },
    {
      "code": 6004,
      "name": "MintDoesNotMatchBondingCurve",
      "msg": "The mint does not match the bonding curve."
    },
    {
      "code": 6005,
      "name": "BondingCurveComplete",
      "msg": "The bonding curve has completed and liquidity migrated to raydium."
    },
    {
      "code": 6006,
      "name": "BondingCurveNotComplete",
      "msg": "The bonding curve has not completed."
    },
    {
      "code": 6007,
      "name": "NotInitialized",
      "msg": "The program is not initialized."
    },
    {
      "code": 6008,
      "name": "WithdrawTooFrequent",
      "msg": "Withdraw too frequent"
    },
    {
      "code": 6009,
      "name": "NewSizeShouldBeGreaterThanCurrentSize",
      "msg": "new_size should be > current_size"
    },
    {
      "code": 6010,
      "name": "AccountTypeNotSupported",
      "msg": "Account type not supported"
    },
    {
      "code": 6011,
      "name": "InitialRealTokenReservesShouldBeLessThanTokenTotalSupply",
      "msg": "initial_real_token_reserves should be less than token_total_supply"
    },
    {
      "code": 6012,
      "name": "InitialVirtualTokenReservesShouldBeGreaterThanInitialRealTokenReserves",
      "msg": "initial_virtual_token_reserves should be greater than initial_real_token_reserves"
    },
    {
      "code": 6013,
      "name": "FeeBasisPointsGreaterThanMaximum",
      "msg": "fee_basis_points greater than maximum"
    },
    {
      "code": 6014,
      "name": "AllZerosWithdrawAuthority",
      "msg": "Withdraw authority cannot be set to System Program ID"
    },
    {
      "code": 6015,
      "name": "PoolMigrationFeeShouldBeLessThanFinalRealSolReserves",
      "msg": "pool_migration_fee should be less than final_real_sol_reserves"
    },
    {
      "code": 6016,
      "name": "PoolMigrationFeeShouldBeGreaterThanCreatorFeePlusMaxMigrateFees",
      "msg": "pool_migration_fee should be greater than creator_fee + MAX_MIGRATE_FEES"
    },
    {
      "code": 6017,
      "name": "DisabledWithdraw",
      "msg": "Migrate instruction is disabled"
    },
    {
      "code": 6018,
      "name": "DisabledMigrate",
      "msg": "Migrate instruction is disabled"
    },
    {
      "code": 6019,
      "name": "InvalidCreator",
      "msg": "Invalid creator pubkey"
    },
    {
      "code": 6020,
      "name": "BuyZeroAmount",
      "msg": "Buy zero amount"
    },
    {
      "code": 6021,
      "name": "NotEnoughTokensToBuy",
      "msg": "Not enough tokens to buy"
    },
    {
      "code": 6022,
      "name": "SellZeroAmount",
      "msg": "Sell zero amount"
    },
    {
      "code": 6023,
      "name": "NotEnoughTokensToSell",
      "msg": "Not enough tokens to sell"
    },
    {
      "code": 6024,
      "name": "Overflow",
      "msg": "Overflow"
    },
    {
      "code": 6025,
      "name": "Truncation",
      "msg": "Truncation"
    },
    {
      "code": 6026,
      "name": "DivisionByZero",
      "msg": "Division by zero"
    },
    {
      "code": 6027,
      "name": "NotEnoughRemainingAccounts",
      "msg": "Not enough remaining accounts"
    },
    {
      "code": 6028,
      "name": "AllFeeRecipientsShouldBeNonZero",
      "msg": "All fee recipients should be non-zero"
    },
    {
      "code": 6029,
      "name": "UnsortedNotUniqueFeeRecipients",
      "msg": "Unsorted or not unique fee recipients"
    },
    {
      "code": 6030,
      "name": "CreatorShouldNotBeZero",
      "msg": "Creator should not be zero"
    },
    {
      "code": 6031,
      "name": "StartTimeInThePast"
    },
    {
      "code": 6032,
      "name": "EndTimeInThePast"
    },
    {
      "code": 6033,
      "name": "EndTimeBeforeStartTime"
    },
    {
      "code": 6034,
      "name": "TimeRangeTooLarge"
    },
    {
      "code": 6035,
      "name": "EndTimeBeforeCurrentDay"
    },
    {
      "code": 6036,
      "name": "SupplyUpdateForFinishedRange"
    },
    {
      "code": 6037,
      "name": "DayIndexAfterEndIndex"
    },
    {
      "code": 6038,
      "name": "DayInActiveRange"
    },
    {
      "code": 6039,
      "name": "InvalidIncentiveMint"
    },
    {
      "code": 6040,
      "name": "BuyNotEnoughSolToCoverRent",
      "msg": "Buy: Not enough SOL to cover for rent exemption."
    },
    {
      "code": 6041,
      "name": "BuyNotEnoughSolToCoverFees",
      "msg": "Buy: Not enough SOL to cover for fees."
    },
    {
      "code": 6042,
      "name": "BuySlippageBelowMinTokensOut",
      "msg": "Slippage: Would buy less tokens than expected min_tokens_out"
    },
    {
      "code": 6043,
      "name": "NameTooLong"
    },
    {
      "code": 6044,
      "name": "SymbolTooLong"
    },
    {
      "code": 6045,
      "name": "UriTooLong"
    },
    {
      "code": 6046,
      "name": "CreateV2Disabled"
    },
    {
      "code": 6047,
      "name": "CpitializeMayhemFailed"
    },
    {
      "code": 6048,
      "name": "MayhemModeDisabled"
    },
    {
      "code": 6049,
      "name": "CreatorMigratedToSharingConfig",
      "msg": "creator has been migrated to sharing config"
    },
    {
      "code": 6050,
      "name": "UnableToDistributeCreatorVaultMigratedToSharingConfig",
      "msg": "creator_vault has been migrated to sharing config, use pump:distribute_creator_fees instead"
    },
    {
      "code": 6051,
      "name": "SharingConfigNotActive",
      "msg": "Sharing config is not active"
    },
    {
      "code": 6052,
      "name": "UnableToDistributeCreatorFeesToExecutableRecipient",
      "msg": "The recipient account is executable, so it cannot receive lamports, remove it from the team first"
    },
    {
      "code": 6053,
      "name": "BondingCurveAndSharingConfigCreatorMismatch",
      "msg": "Bonding curve creator does not match sharing config"
    },
    {
      "code": 6054,
      "name": "ShareholdersAndRemainingAccountsMismatch",
      "msg": "Remaining accounts do not match shareholders, make sure to pass exactly the same pubkeys in the same order"
    },
    {
      "code": 6055,
      "name": "InvalidShareBps",
      "msg": "Share bps must be greater than 0"
    },
    {
      "code": 6056,
      "name": "CashbackNotEnabled",
      "msg": "Cashback is not enabled"
    },
    {
      "code": 6057,
      "name": "BuybackFeeRecipientNotAuthorized",
      "msg": "Buyback fee recipient not authorized"
    },
    {
      "code": 6058,
      "name": "AllBuybackFeeRecipientsShouldBeNonZero"
    },
    {
      "code": 6059,
      "name": "NotUniqueBuybackFeeRecipients"
    },
    {
      "code": 6060,
      "name": "BuybackBasisPointsOutOfRange",
      "msg": "buyback_basis_points must be <= 10_000"
    },
    {
      "code": 6061,
      "name": "WrongBuybackFeeRecipientsCount",
      "msg": "buyback fee recipients require exactly 8 remaining accounts (or none)"
    },
    {
      "code": 6062,
      "name": "BuybackFeeRecipientMissing"
    },
    {
      "code": 6063,
      "name": "UnsupportedQuoteMint",
      "msg": "Unsupported quote mint"
    },
    {
      "code": 6064,
      "name": "InvalidQuoteTokenProgram",
      "msg": "Create v2: quote token program must be SPL Token or Token-2022"
    },
    {
      "code": 6065,
      "name": "InvalidAssociatedQuoteBondingCurve",
      "msg": "Create v2: associated quote bonding curve address does not match derivation"
    },
    {
      "code": 6066,
      "name": "QuoteMintWhitelistFull",
      "msg": "Quote mint whitelist is full"
    },
    {
      "code": 6067,
      "name": "QuoteMintAlreadyWhitelisted",
      "msg": "Quote mint is already whitelisted"
    },
    {
      "code": 6068,
      "name": "QuoteMintNotWhitelisted",
      "msg": "Quote mint is not in the whitelist"
    },
    {
      "code": 6069,
      "name": "QuoteMintNotEligibleForWhitelist",
      "msg": "Quote mint cannot be added or removed via whitelist (default or native SOL mint)"
    },
    {
      "code": 6070,
      "name": "UnableToDistributeCreatorFeesToUninitializedAccount",
      "msg": "Unable to distribute creator fees to uninitialized account"
    },
    {
      "code": 6071,
      "name": "MayhemModeQuoteMintNotAllowed",
      "msg": "Mayhem mode quote mint not allowed"
    },
    {
      "code": 6072,
      "name": "MissingCashbackAccounts",
      "msg": "Cashback trade is missing the required remaining accounts"
    },
    {
      "code": 6073,
      "name": "InvalidCashbackAccumulator",
      "msg": "Cashback user_volume_accumulator account is invalid"
    },
    {
      "code": 6074,
      "name": "InvalidBondingCurveV2",
      "msg": "bonding_curve_v2 remaining account is missing or invalid"
    },
    {
      "code": 6075,
      "name": "InvalidQuoteControl",
      "msg": "quote_control remaining account does not match derivation or is uninitialized"
    },
    {
      "code": 6076,
      "name": "InvalidCashbackRecipient",
      "msg": "Cashback recipient token account is not owned by user"
    },
    {
      "code": 6077,
      "name": "CreatorFeeNotConfigurable",
      "msg": "Configurable creator fees are disabled"
    },
    {
      "code": 6078,
      "name": "CreatorFeeBpsOutOfRange",
      "msg": "Creator fee basis points must be between 1 and the configured maximum"
    },
    {
      "code": 6079,
      "name": "CreatorFeeNotEditable",
      "msg": "Creator fee is not editable for this bonding curve"
    },
    {
      "code": 6080,
      "name": "CreatorFeeNotAllowedForCashbackCoin",
      "msg": "Creator fee cannot be configured for a cashback coin"
    },
    {
      "code": 6081,
      "name": "BondingCurveAlreadyMigrated",
      "msg": "Bonding curve has already migrated"
    },
    {
      "code": 6082,
      "name": "CashbackDeprecated",
      "msg": "Cashback coins can no longer be created"
    },
    {
      "code": 6083,
      "name": "HolderRewardCreatorImmutable",
      "msg": "The creator of a holder-reward coin cannot be changed"
    },
    {
      "code": 6084,
      "name": "HolderRewardDisabled",
      "msg": "Holder-reward coins are disabled"
    },
    {
      "code": 6085,
      "name": "HolderRewardRecipientsMismatch",
      "msg": "Holder-reward amounts and recipient accounts do not match"
    },
    {
      "code": 6086,
      "name": "HolderRewardsRentFloor",
      "msg": "The holder-rewards PDA cannot be left below its rent-exempt minimum"
    },
    {
      "code": 6087,
      "name": "HolderRewardTokenAccountMissing",
      "msg": "A holder-rewards token account is required on a token quote"
    },
    {
      "code": 6088,
      "name": "CtoNotAllowedForMayhemCoin",
      "msg": "CTO is not allowed on a mayhem-mode coin"
    },
    {
      "code": 6089,
      "name": "CtoNewCreatorRequired",
      "msg": "new_creator is required unless converting to holder rewards"
    },
    {
      "code": 6090,
      "name": "CtoNewCreatorNotAllowed",
      "msg": "new_creator must be omitted when converting to holder rewards"
    },
    {
      "code": 6091,
      "name": "CreatorFeeNotConfigurableForQuote",
      "msg": "Creator fee is not configurable on a SOL or whitelisted quote; the fee schedule applies"
    },
    {
      "code": 6092,
      "name": "CtoCreatorAccountNotWritable",
      "msg": "current_creator must be passed writable so the outgoing creator can be paid"
    },
    {
      "code": 6093,
      "name": "CtoSharedVaultFrozen",
      "msg": "A frozen sharing-config vault account holds a balance; thaw it before the holder conversion"
    },
    {
      "code": 6094,
      "name": "CashbackCoinNotSupported",
      "msg": "v3 trades do not support cashback coins; use the v2 instructions"
    },
    {
      "code": 6095,
      "name": "CreatorFeesNotSwept",
      "msg": "creator_fee must be swept before the creator changes or the vault is distributed"
    },
    {
      "code": 6096,
      "name": "FeeTiersEmpty",
      "msg": "The fee config tier table is empty"
    },
    {
      "code": 6097,
      "name": "FeeConfigTooShort",
      "msg": "The fee config account is shorter than its initialize size"
    },
    {
      "code": 6098,
      "name": "MultiHopDiscontinuousPath",
      "msg": "multi-hop: a hop's input mint is neither side of its bonding curve"
    },
    {
      "code": 6099,
      "name": "InvalidQuoteBondingCurve",
      "msg": "Quote bonding curve remaining account does not match derivation or is uninitialized"
    },
    {
      "code": 6100,
      "name": "QuoteBondingCurveNotEligible",
      "msg": "Quote bonding curve is not eligible as a quote: mayhem mode, or the chain's depth-0 root is quoted in a mint no list admits"
    },
    {
      "code": 6101,
      "name": "QuotePoolAccountsRequired",
      "msg": "A quote-chain bonding curve has migrated: its pool and vault remaining accounts are required"
    },
    {
      "code": 6102,
      "name": "QuotePoolNotFound",
      "msg": "Quote pool remaining account is not an initialized pump-amm pool"
    },
    {
      "code": 6103,
      "name": "InvalidQuotePool",
      "msg": "Quote pool or vault remaining accounts do not match derivation or are invalid"
    },
    {
      "code": 6104,
      "name": "QuoteReservesOutOfRange",
      "msg": "Derived quote reserves are zero"
    },
    {
      "code": 6105,
      "name": "CurveDepthExceeded",
      "msg": "The new curve's depth (quote coin depth plus one) exceeds Global.max_curve_depth or the program's cap of 5"
    },
    {
      "code": 6106,
      "name": "MultiHopHopFeesMismatch",
      "msg": "multi-hop: hop_fees must carry one flag byte per curve hop using only the protocol and creator bits"
    },
    {
      "code": 6107,
      "name": "QuoteCurveAwaitingMigration",
      "msg": "A quote-chain coin's curve is complete but not yet migrated; retry once migrate_v2 creates its pool"
    },
    {
      "code": 6108,
      "name": "MultiHopMayhemCurveNotSupported",
      "msg": "multi-hop: mayhem-mode curves are not routable; use the v2 instructions"
    },
    {
      "code": 6109,
      "name": "QuoteChainAccountsRequired",
      "msg": "The quote coin is nested: a bonding curve remaining account is required for every coin on its quote chain down to the depth-0 root"
    },
    {
      "code": 6110,
      "name": "QuoteMintNotWritable",
      "msg": "quote_mint must be writable for a quote with a Token-2022 transfer fee: its withheld fees are harvested to the mint"
    }
  ],
  "types": [
    {
      "name": "AddQuoteControlMintEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "quote_control",
            "type": "pubkey"
          },
          {
            "name": "authority",
            "type": "pubkey"
          },
          {
            "name": "quote_mint",
            "type": "pubkey"
          },
          {
            "name": "initial_virtual_quote_reserves",
            "type": "u64"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "AdminCtoEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "timestamp",
            "type": "i64"
          },
          {
            "name": "authority",
            "type": "pubkey"
          },
          {
            "name": "mint",
            "type": "pubkey"
          },
          {
            "name": "bonding_curve",
            "type": "pubkey"
          },
          {
            "name": "old_creator",
            "type": "pubkey"
          },
          {
            "name": "new_creator",
            "type": "pubkey"
          },
          {
            "name": "is_holder_reward",
            "type": "bool"
          },
          {
            "name": "is_cashback_coin",
            "type": "bool"
          },
          {
            "name": "old_creator_fee_bps",
            "type": "u64"
          },
          {
            "name": "new_creator_fee_bps",
            "type": "u64"
          },
          {
            "name": "sharing_config_reset",
            "type": "bool"
          },
          {
            "name": "swept_to_holder_vault",
            "type": "u64"
          },
          {
            "name": "pool_updated",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "AdminSetIdlAuthorityEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "idl_authority",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "AdminUpdateTokenIncentivesEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "start_time",
            "type": "i64"
          },
          {
            "name": "end_time",
            "type": "i64"
          },
          {
            "name": "day_number",
            "type": "u64"
          },
          {
            "name": "token_supply_per_day",
            "type": "u64"
          },
          {
            "name": "mint",
            "type": "pubkey"
          },
          {
            "name": "seconds_in_a_day",
            "type": "i64"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "BondingCurve",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "virtual_token_reserves",
            "type": "u64"
          },
          {
            "name": "virtual_quote_reserves",
            "type": "u64"
          },
          {
            "name": "real_token_reserves",
            "type": "u64"
          },
          {
            "name": "real_quote_reserves",
            "type": "u64"
          },
          {
            "name": "token_total_supply",
            "type": "u64"
          },
          {
            "name": "complete",
            "type": "bool"
          },
          {
            "name": "creator",
            "type": "pubkey"
          },
          {
            "name": "is_mayhem_mode",
            "type": "bool"
          },
          {
            "name": "is_cashback_coin",
            "type": "bool"
          },
          {
            "name": "quote_mint",
            "type": "pubkey"
          },
          {
            "name": "creator_fee_bps",
            "type": "u64"
          },
          {
            "name": "can_edit_creator_fee",
            "type": "bool"
          },
          {
            "name": "is_holder_reward",
            "type": "bool"
          },
          {
            "name": "creator_fee",
            "type": "u64"
          },
          {
            "name": "protocol_fees",
            "type": "u64"
          },
          {
            "name": "depth",
            "type": "u8"
          },
          {
            "name": "initial_virtual_quote_reserves",
            "type": "u64"
          },
          {
            "name": "post_complete_base_out",
            "type": "u64"
          },
          {
            "name": "post_complete_quote_in",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "ClaimCashbackEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "user",
            "type": "pubkey"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "timestamp",
            "type": "i64"
          },
          {
            "name": "total_claimed",
            "type": "u64"
          },
          {
            "name": "total_cashback_earned",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "ClaimTokenIncentivesEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "user",
            "type": "pubkey"
          },
          {
            "name": "mint",
            "type": "pubkey"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "timestamp",
            "type": "i64"
          },
          {
            "name": "total_claimed_tokens",
            "type": "u64"
          },
          {
            "name": "current_sol_volume",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "CloseUserVolumeAccumulatorEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "user",
            "type": "pubkey"
          },
          {
            "name": "timestamp",
            "type": "i64"
          },
          {
            "name": "total_unclaimed_tokens",
            "type": "u64"
          },
          {
            "name": "total_claimed_tokens",
            "type": "u64"
          },
          {
            "name": "current_sol_volume",
            "type": "u64"
          },
          {
            "name": "last_update_timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "CollectCreatorFeeEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "timestamp",
            "type": "i64"
          },
          {
            "name": "creator",
            "type": "pubkey"
          },
          {
            "name": "creator_fee",
            "type": "u64"
          },
          {
            "name": "quote_mint",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "CompleteEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "user",
            "type": "pubkey"
          },
          {
            "name": "mint",
            "type": "pubkey"
          },
          {
            "name": "bonding_curve",
            "type": "pubkey"
          },
          {
            "name": "timestamp",
            "type": "i64"
          },
          {
            "name": "quote_mint",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "CompletePumpAmmMigrationEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "user",
            "type": "pubkey"
          },
          {
            "name": "mint",
            "type": "pubkey"
          },
          {
            "name": "mint_amount",
            "type": "u64"
          },
          {
            "name": "sol_amount",
            "docs": [
              "The variable is interpreted as `amount` in the offchain services",
              "It is amount in terms of quoteMint for the bondingCurve",
              "The rename is not done yet to avoid breaking changes in offchain services."
            ],
            "type": "u64"
          },
          {
            "name": "pool_migration_fee",
            "type": "u64"
          },
          {
            "name": "bonding_curve",
            "type": "pubkey"
          },
          {
            "name": "timestamp",
            "type": "i64"
          },
          {
            "name": "pool",
            "type": "pubkey"
          },
          {
            "name": "quote_mint",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "ConfigStatus",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Paused"
          },
          {
            "name": "Active"
          }
        ]
      }
    },
    {
      "name": "CreateEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "symbol",
            "type": "string"
          },
          {
            "name": "uri",
            "type": "string"
          },
          {
            "name": "mint",
            "type": "pubkey"
          },
          {
            "name": "bonding_curve",
            "type": "pubkey"
          },
          {
            "name": "user",
            "type": "pubkey"
          },
          {
            "name": "creator",
            "type": "pubkey"
          },
          {
            "name": "timestamp",
            "type": "i64"
          },
          {
            "name": "virtual_token_reserves",
            "type": "u64"
          },
          {
            "name": "virtual_sol_reserves",
            "type": "u64"
          },
          {
            "name": "real_token_reserves",
            "type": "u64"
          },
          {
            "name": "token_total_supply",
            "type": "u64"
          },
          {
            "name": "token_program",
            "type": "pubkey"
          },
          {
            "name": "is_mayhem_mode",
            "type": "bool"
          },
          {
            "name": "is_cashback_enabled",
            "type": "bool"
          },
          {
            "name": "quote_mint",
            "type": "pubkey"
          },
          {
            "name": "virtual_quote_reserves",
            "type": "u64"
          },
          {
            "name": "creator_fee_bps",
            "type": "u64"
          },
          {
            "name": "is_holder_reward",
            "type": "bool"
          },
          {
            "name": "depth",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "CurveRunResult",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "amount_out",
            "type": "u64"
          },
          {
            "name": "buyback_fee",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "DistributeCreatorFeesEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "timestamp",
            "type": "i64"
          },
          {
            "name": "mint",
            "type": "pubkey"
          },
          {
            "name": "bonding_curve",
            "type": "pubkey"
          },
          {
            "name": "sharing_config",
            "type": "pubkey"
          },
          {
            "name": "admin",
            "type": "pubkey"
          },
          {
            "name": "shareholders",
            "type": {
              "vec": {
                "defined": {
                  "name": "Shareholder"
                }
              }
            }
          },
          {
            "name": "distributed",
            "type": "u64"
          },
          {
            "name": "quote_mint",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "DistributeFeeToHoldersEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "timestamp",
            "type": "i64"
          },
          {
            "name": "mint",
            "type": "pubkey"
          },
          {
            "name": "quote_mint",
            "type": "pubkey"
          },
          {
            "name": "recipients",
            "type": "u64"
          },
          {
            "name": "total",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "ExtendAccountEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "account",
            "type": "pubkey"
          },
          {
            "name": "user",
            "type": "pubkey"
          },
          {
            "name": "current_size",
            "type": "u64"
          },
          {
            "name": "new_size",
            "type": "u64"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "FeeConfig",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "admin",
            "type": "pubkey"
          },
          {
            "name": "flat_fees",
            "type": {
              "defined": {
                "name": "Fees"
              }
            }
          },
          {
            "name": "fee_tiers",
            "type": {
              "vec": {
                "defined": {
                  "name": "FeeTier"
                }
              }
            }
          },
          {
            "name": "stable_fee_tiers",
            "type": {
              "vec": {
                "defined": {
                  "name": "FeeTier"
                }
              }
            }
          },
          {
            "name": "exotic_flat_fees",
            "type": {
              "defined": {
                "name": "Fees"
              }
            }
          }
        ]
      }
    },
    {
      "name": "FeeTier",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "market_cap_lamports_threshold",
            "type": "u128"
          },
          {
            "name": "fees",
            "type": {
              "defined": {
                "name": "Fees"
              }
            }
          }
        ]
      }
    },
    {
      "name": "Fees",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "lp_fee_bps",
            "type": "u64"
          },
          {
            "name": "protocol_fee_bps",
            "type": "u64"
          },
          {
            "name": "creator_fee_bps",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "Global",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "initialized",
            "docs": [
              "Unused"
            ],
            "type": "bool"
          },
          {
            "name": "authority",
            "type": "pubkey"
          },
          {
            "name": "fee_recipient",
            "type": "pubkey"
          },
          {
            "name": "initial_virtual_token_reserves",
            "type": "u64"
          },
          {
            "name": "initial_virtual_sol_reserves",
            "type": "u64"
          },
          {
            "name": "initial_real_token_reserves",
            "type": "u64"
          },
          {
            "name": "token_total_supply",
            "type": "u64"
          },
          {
            "name": "fee_basis_points",
            "type": "u64"
          },
          {
            "name": "withdraw_authority",
            "type": "pubkey"
          },
          {
            "name": "enable_migrate",
            "docs": [
              "Unused"
            ],
            "type": "bool"
          },
          {
            "name": "pool_migration_fee",
            "type": "u64"
          },
          {
            "name": "creator_fee_basis_points",
            "type": "u64"
          },
          {
            "name": "fee_recipients",
            "type": {
              "array": [
                "pubkey",
                7
              ]
            }
          },
          {
            "name": "set_creator_authority",
            "type": "pubkey"
          },
          {
            "name": "admin_set_creator_authority",
            "type": "pubkey"
          },
          {
            "name": "create_v2_enabled",
            "type": "bool"
          },
          {
            "name": "whitelist_pda",
            "type": "pubkey"
          },
          {
            "name": "reserved_fee_recipient",
            "type": "pubkey"
          },
          {
            "name": "mayhem_mode_enabled",
            "type": "bool"
          },
          {
            "name": "reserved_fee_recipients",
            "type": {
              "array": [
                "pubkey",
                7
              ]
            }
          },
          {
            "name": "is_cashback_enabled",
            "type": "bool"
          },
          {
            "name": "buyback_fee_recipients",
            "type": {
              "array": [
                "pubkey",
                8
              ]
            }
          },
          {
            "name": "buyback_basis_points",
            "type": "u64"
          },
          {
            "name": "initial_virtual_quote_reserves",
            "type": "u64"
          },
          {
            "name": "whitelisted_quote_mints",
            "type": {
              "array": [
                "pubkey",
                1
              ]
            }
          },
          {
            "name": "creator_fee_configurable",
            "type": "bool"
          },
          {
            "name": "max_configurable_creator_fee_bps",
            "type": "u64"
          },
          {
            "name": "holder_reward_claim_authority",
            "type": "pubkey"
          },
          {
            "name": "is_holder_reward_enabled",
            "type": "bool"
          },
          {
            "name": "max_curve_depth",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "GlobalVolumeAccumulator",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "start_time",
            "type": "i64"
          },
          {
            "name": "end_time",
            "type": "i64"
          },
          {
            "name": "seconds_in_a_day",
            "type": "i64"
          },
          {
            "name": "mint",
            "type": "pubkey"
          },
          {
            "name": "total_token_supply",
            "type": {
              "array": [
                "u64",
                30
              ]
            }
          },
          {
            "name": "sol_volumes",
            "type": {
              "array": [
                "u64",
                30
              ]
            }
          }
        ]
      }
    },
    {
      "name": "InitUserVolumeAccumulatorEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "payer",
            "type": "pubkey"
          },
          {
            "name": "user",
            "type": "pubkey"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "MigrateBondingCurveCreatorEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "timestamp",
            "type": "i64"
          },
          {
            "name": "mint",
            "type": "pubkey"
          },
          {
            "name": "bonding_curve",
            "type": "pubkey"
          },
          {
            "name": "sharing_config",
            "type": "pubkey"
          },
          {
            "name": "old_creator",
            "type": "pubkey"
          },
          {
            "name": "new_creator",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "MinimumDistributableFeeEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "minimum_required",
            "type": "u64"
          },
          {
            "name": "distributable_fees",
            "type": "u64"
          },
          {
            "name": "can_distribute",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "OptionBool",
      "type": {
        "kind": "struct",
        "fields": [
          "bool"
        ]
      }
    },
    {
      "name": "OptionU64",
      "type": {
        "kind": "struct",
        "fields": [
          "u64"
        ]
      }
    },
    {
      "name": "PostCompleteBuyEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "user",
            "type": "pubkey"
          },
          {
            "name": "mint",
            "type": "pubkey"
          },
          {
            "name": "bonding_curve",
            "type": "pubkey"
          },
          {
            "name": "quote_mint",
            "type": "pubkey"
          },
          {
            "name": "timestamp",
            "type": "i64"
          },
          {
            "name": "base_out",
            "type": "u64"
          },
          {
            "name": "quote_in",
            "type": "u64"
          },
          {
            "name": "fee_basis_points",
            "type": "u64"
          },
          {
            "name": "fee",
            "type": "u64"
          },
          {
            "name": "creator_fee_basis_points",
            "type": "u64"
          },
          {
            "name": "creator_fee",
            "type": "u64"
          },
          {
            "name": "buyback_fee",
            "type": "u64"
          },
          {
            "name": "pool_base_reserves_before",
            "type": "u64"
          },
          {
            "name": "pool_quote_reserves_before",
            "type": "u64"
          },
          {
            "name": "pool_base_reserves_after",
            "type": "u64"
          },
          {
            "name": "pool_quote_reserves_after",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "QuoteControl",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "admin",
            "type": "pubkey"
          },
          {
            "name": "reserves_admin",
            "type": "pubkey"
          },
          {
            "name": "_reserved",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "mints",
            "type": {
              "vec": {
                "defined": {
                  "name": "QuoteControlMint"
                }
              }
            }
          }
        ]
      }
    },
    {
      "name": "QuoteControlMint",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "mint",
            "type": "pubkey"
          },
          {
            "name": "initial_virtual_quote_reserves",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "RemoveQuoteControlMintEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "quote_control",
            "type": "pubkey"
          },
          {
            "name": "authority",
            "type": "pubkey"
          },
          {
            "name": "quote_mint",
            "type": "pubkey"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "ReservedFeeRecipientsEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "timestamp",
            "type": "i64"
          },
          {
            "name": "reserved_fee_recipient",
            "type": "pubkey"
          },
          {
            "name": "reserved_fee_recipients",
            "type": {
              "array": [
                "pubkey",
                7
              ]
            }
          }
        ]
      }
    },
    {
      "name": "SetCreatorEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "timestamp",
            "type": "i64"
          },
          {
            "name": "mint",
            "type": "pubkey"
          },
          {
            "name": "bonding_curve",
            "type": "pubkey"
          },
          {
            "name": "creator",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "SetMetaplexCreatorEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "timestamp",
            "type": "i64"
          },
          {
            "name": "mint",
            "type": "pubkey"
          },
          {
            "name": "bonding_curve",
            "type": "pubkey"
          },
          {
            "name": "metadata",
            "type": "pubkey"
          },
          {
            "name": "creator",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "SetParamsEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "initial_virtual_token_reserves",
            "type": "u64"
          },
          {
            "name": "initial_virtual_sol_reserves",
            "type": "u64"
          },
          {
            "name": "initial_real_token_reserves",
            "type": "u64"
          },
          {
            "name": "final_real_sol_reserves",
            "type": "u64"
          },
          {
            "name": "token_total_supply",
            "type": "u64"
          },
          {
            "name": "fee_basis_points",
            "type": "u64"
          },
          {
            "name": "withdraw_authority",
            "type": "pubkey"
          },
          {
            "name": "enable_migrate",
            "type": "bool"
          },
          {
            "name": "pool_migration_fee",
            "type": "u64"
          },
          {
            "name": "creator_fee_basis_points",
            "type": "u64"
          },
          {
            "name": "fee_recipients",
            "type": {
              "array": [
                "pubkey",
                8
              ]
            }
          },
          {
            "name": "timestamp",
            "type": "i64"
          },
          {
            "name": "set_creator_authority",
            "type": "pubkey"
          },
          {
            "name": "admin_set_creator_authority",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "SetQuoteControlAdminEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "quote_control",
            "type": "pubkey"
          },
          {
            "name": "authority",
            "type": "pubkey"
          },
          {
            "name": "old_admin",
            "type": "pubkey"
          },
          {
            "name": "new_admin",
            "type": "pubkey"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "SetQuoteControlMintReservesEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "quote_control",
            "type": "pubkey"
          },
          {
            "name": "authority",
            "type": "pubkey"
          },
          {
            "name": "quote_mint",
            "type": "pubkey"
          },
          {
            "name": "old_initial_virtual_quote_reserves",
            "type": "u64"
          },
          {
            "name": "new_initial_virtual_quote_reserves",
            "type": "u64"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "SetQuoteControlReservesAdminEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "quote_control",
            "type": "pubkey"
          },
          {
            "name": "authority",
            "type": "pubkey"
          },
          {
            "name": "old_reserves_admin",
            "type": "pubkey"
          },
          {
            "name": "new_reserves_admin",
            "type": "pubkey"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "Shareholder",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "address",
            "type": "pubkey"
          },
          {
            "name": "share_bps",
            "type": "u16"
          }
        ]
      }
    },
    {
      "name": "SharingConfig",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "version",
            "type": "u8"
          },
          {
            "name": "status",
            "type": {
              "defined": {
                "name": "ConfigStatus"
              }
            }
          },
          {
            "name": "mint",
            "type": "pubkey"
          },
          {
            "name": "admin",
            "type": "pubkey"
          },
          {
            "name": "admin_revoked",
            "type": "bool"
          },
          {
            "name": "shareholders",
            "type": {
              "vec": {
                "defined": {
                  "name": "Shareholder"
                }
              }
            }
          }
        ]
      }
    },
    {
      "name": "SweepBondingCurveFeeEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "timestamp",
            "type": "i64"
          },
          {
            "name": "mint",
            "type": "pubkey"
          },
          {
            "name": "bonding_curve",
            "type": "pubkey"
          },
          {
            "name": "quote_mint",
            "type": "pubkey"
          },
          {
            "name": "recipient",
            "type": "pubkey"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "bucket",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "SyncUserVolumeAccumulatorEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "user",
            "type": "pubkey"
          },
          {
            "name": "total_claimed_tokens_before",
            "type": "u64"
          },
          {
            "name": "total_claimed_tokens_after",
            "type": "u64"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "TradeEvent",
      "docs": [
        "ix_name: \"buy\" | \"sell\" | \"buy_exact_sol_in\""
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "mint",
            "type": "pubkey"
          },
          {
            "name": "sol_amount",
            "type": "u64"
          },
          {
            "name": "token_amount",
            "type": "u64"
          },
          {
            "name": "is_buy",
            "type": "bool"
          },
          {
            "name": "user",
            "type": "pubkey"
          },
          {
            "name": "timestamp",
            "type": "i64"
          },
          {
            "name": "virtual_sol_reserves",
            "type": "u64"
          },
          {
            "name": "virtual_token_reserves",
            "type": "u64"
          },
          {
            "name": "real_sol_reserves",
            "type": "u64"
          },
          {
            "name": "real_token_reserves",
            "type": "u64"
          },
          {
            "name": "fee_recipient",
            "type": "pubkey"
          },
          {
            "name": "fee_basis_points",
            "type": "u64"
          },
          {
            "name": "fee",
            "type": "u64"
          },
          {
            "name": "creator",
            "type": "pubkey"
          },
          {
            "name": "creator_fee_basis_points",
            "type": "u64"
          },
          {
            "name": "creator_fee",
            "type": "u64"
          },
          {
            "name": "track_volume",
            "type": "bool"
          },
          {
            "name": "total_unclaimed_tokens",
            "type": "u64"
          },
          {
            "name": "total_claimed_tokens",
            "type": "u64"
          },
          {
            "name": "current_sol_volume",
            "type": "u64"
          },
          {
            "name": "last_update_timestamp",
            "type": "i64"
          },
          {
            "name": "ix_name",
            "type": "string"
          },
          {
            "name": "mayhem_mode",
            "type": "bool"
          },
          {
            "name": "cashback_fee_basis_points",
            "type": "u64"
          },
          {
            "name": "cashback",
            "type": "u64"
          },
          {
            "name": "buyback_fee_basis_points",
            "type": "u64"
          },
          {
            "name": "buyback_fee",
            "type": "u64"
          },
          {
            "name": "shareholders",
            "type": {
              "vec": {
                "defined": {
                  "name": "Shareholder"
                }
              }
            }
          },
          {
            "name": "quote_mint",
            "type": "pubkey"
          },
          {
            "name": "quote_amount",
            "type": "u64"
          },
          {
            "name": "virtual_quote_reserves",
            "type": "u64"
          },
          {
            "name": "real_quote_reserves",
            "type": "u64"
          },
          {
            "name": "holder_rewards_bps",
            "type": "u64"
          },
          {
            "name": "holder_rewards",
            "type": "u64"
          },
          {
            "name": "creator_fee_unclaimed",
            "type": "u64"
          },
          {
            "name": "quote_transfer_fee",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "UpdateCreatorFeeConfigEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "timestamp",
            "type": "i64"
          },
          {
            "name": "authority",
            "type": "pubkey"
          },
          {
            "name": "creator_fee_configurable",
            "type": "bool"
          },
          {
            "name": "max_configurable_creator_fee_bps",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "UpdateGlobalAuthorityEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "global",
            "type": "pubkey"
          },
          {
            "name": "authority",
            "type": "pubkey"
          },
          {
            "name": "new_authority",
            "type": "pubkey"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "UpdateMayhemVirtualParamsEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "timestamp",
            "type": "i64"
          },
          {
            "name": "mint",
            "type": "pubkey"
          },
          {
            "name": "virtual_token_reserves",
            "type": "u64"
          },
          {
            "name": "virtual_sol_reserves",
            "type": "u64"
          },
          {
            "name": "new_virtual_token_reserves",
            "type": "u64"
          },
          {
            "name": "new_virtual_sol_reserves",
            "type": "u64"
          },
          {
            "name": "real_token_reserves",
            "type": "u64"
          },
          {
            "name": "real_sol_reserves",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "UserVolumeAccumulator",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "user",
            "type": "pubkey"
          },
          {
            "name": "needs_claim",
            "type": "bool"
          },
          {
            "name": "total_unclaimed_tokens",
            "type": "u64"
          },
          {
            "name": "total_claimed_tokens",
            "type": "u64"
          },
          {
            "name": "current_sol_volume",
            "type": "u64"
          },
          {
            "name": "last_update_timestamp",
            "type": "i64"
          },
          {
            "name": "has_total_claimed_tokens",
            "type": "bool"
          },
          {
            "name": "cashback_earned",
            "type": "u64"
          },
          {
            "name": "total_cashback_claimed",
            "type": "u64"
          },
          {
            "name": "stable_cashback_earned",
            "type": "u64"
          },
          {
            "name": "total_stable_cashback_claimed",
            "type": "u64"
          }
        ]
      }
    }
  ]
};

export const pumpAmmIdl: any = {
  "address": "pAMMBay6oceH9fJKBRHGP5D4bD4sWpmSwMn52FMfXEA",
  "metadata": {
    "name": "pump_amm",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "admin_cto_pool",
      "discriminator": [
        45,
        61,
        165,
        151,
        104,
        0,
        49,
        189
      ],
      "accounts": [
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "global_config"
        },
        {
          "name": "pool",
          "writable": true
        },
        {
          "name": "pool_authority",
          "signer": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  111,
                  111,
                  108,
                  45,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              },
              {
                "kind": "account",
                "path": "pool.base_mint",
                "account": "Pool"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                1,
                86,
                224,
                246,
                147,
                102,
                90,
                207,
                68,
                219,
                21,
                104,
                191,
                23,
                91,
                170,
                81,
                137,
                203,
                151,
                245,
                210,
                255,
                59,
                101,
                93,
                43,
                182,
                253,
                109,
                24,
                176
              ]
            }
          }
        },
        {
          "name": "system_program",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "event_authority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  95,
                  95,
                  101,
                  118,
                  101,
                  110,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "program"
        }
      ],
      "args": [
        {
          "name": "coin_creator",
          "type": "pubkey"
        },
        {
          "name": "is_holder_reward",
          "type": "bool"
        },
        {
          "name": "creator_fee_bps",
          "type": {
            "option": "u64"
          }
        }
      ]
    },
    {
      "name": "admin_update_token_incentives",
      "discriminator": [
        209,
        11,
        115,
        87,
        213,
        23,
        124,
        204
      ],
      "accounts": [
        {
          "name": "admin",
          "writable": true,
          "signer": true,
          "relations": [
            "global_config"
          ]
        },
        {
          "name": "global_config",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  108,
                  111,
                  98,
                  97,
                  108,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "global_volume_accumulator",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  108,
                  111,
                  98,
                  97,
                  108,
                  95,
                  118,
                  111,
                  108,
                  117,
                  109,
                  101,
                  95,
                  97,
                  99,
                  99,
                  117,
                  109,
                  117,
                  108,
                  97,
                  116,
                  111,
                  114
                ]
              }
            ]
          }
        },
        {
          "name": "mint"
        },
        {
          "name": "global_incentive_token_account",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "global_volume_accumulator"
              },
              {
                "kind": "account",
                "path": "token_program"
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "associated_token_program",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "system_program",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "token_program"
        },
        {
          "name": "event_authority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  95,
                  95,
                  101,
                  118,
                  101,
                  110,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "program"
        }
      ],
      "args": [
        {
          "name": "start_time",
          "type": "i64"
        },
        {
          "name": "end_time",
          "type": "i64"
        },
        {
          "name": "seconds_in_a_day",
          "type": "i64"
        },
        {
          "name": "day_number",
          "type": "u64"
        },
        {
          "name": "token_supply_per_day",
          "type": "u64"
        }
      ]
    },
    {
      "name": "boost_buy_and_burn",
      "discriminator": [
        105,
        68,
        6,
        175,
        0,
        7,
        35,
        162
      ],
      "accounts": [
        {
          "name": "pool"
        },
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "global_config",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  108,
                  111,
                  98,
                  97,
                  108,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "base_mint",
          "writable": true,
          "relations": [
            "pool"
          ]
        },
        {
          "name": "quote_mint",
          "relations": [
            "pool"
          ]
        },
        {
          "name": "pool_base_token_account",
          "writable": true,
          "relations": [
            "pool"
          ]
        },
        {
          "name": "pool_quote_token_account",
          "writable": true,
          "relations": [
            "pool"
          ]
        },
        {
          "name": "boost_vault_authority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  111,
                  111,
                  115,
                  116,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "pool"
              }
            ]
          }
        },
        {
          "name": "boost_vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "boost_vault_authority"
              },
              {
                "kind": "account",
                "path": "quote_token_program"
              },
              {
                "kind": "account",
                "path": "quote_mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "base_token_program"
        },
        {
          "name": "quote_token_program"
        },
        {
          "name": "event_authority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  95,
                  95,
                  101,
                  118,
                  101,
                  110,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "program"
        }
      ],
      "args": [
        {
          "name": "quote_amount_in",
          "type": "u64"
        },
        {
          "name": "min_base_amount_burned",
          "type": "u64"
        }
      ]
    },
    {
      "name": "buy",
      "docs": [
        "For cashback coins, optionally pass user_volume_accumulator_wsol_ata as remaining_accounts[0].",
        "If provided and valid, the ATA will be initialized if needed."
      ],
      "discriminator": [
        102,
        6,
        61,
        18,
        1,
        218,
        235,
        234
      ],
      "accounts": [
        {
          "name": "pool",
          "writable": true
        },
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "global_config"
        },
        {
          "name": "base_mint",
          "relations": [
            "pool"
          ]
        },
        {
          "name": "quote_mint",
          "relations": [
            "pool"
          ]
        },
        {
          "name": "user_base_token_account",
          "writable": true
        },
        {
          "name": "user_quote_token_account",
          "writable": true
        },
        {
          "name": "pool_base_token_account",
          "writable": true,
          "relations": [
            "pool"
          ]
        },
        {
          "name": "pool_quote_token_account",
          "writable": true,
          "relations": [
            "pool"
          ]
        },
        {
          "name": "protocol_fee_recipient"
        },
        {
          "name": "protocol_fee_recipient_token_account",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "protocol_fee_recipient"
              },
              {
                "kind": "account",
                "path": "quote_token_program"
              },
              {
                "kind": "account",
                "path": "quote_mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "base_token_program"
        },
        {
          "name": "quote_token_program"
        },
        {
          "name": "system_program",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "associated_token_program",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "event_authority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  95,
                  95,
                  101,
                  118,
                  101,
                  110,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "program",
          "address": "pAMMBay6oceH9fJKBRHGP5D4bD4sWpmSwMn52FMfXEA"
        },
        {
          "name": "coin_creator_vault_ata",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "coin_creator_vault_authority"
              },
              {
                "kind": "account",
                "path": "quote_token_program"
              },
              {
                "kind": "account",
                "path": "quote_mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "coin_creator_vault_authority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  114,
                  101,
                  97,
                  116,
                  111,
                  114,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "pool.coin_creator",
                "account": "Pool"
              }
            ]
          }
        },
        {
          "name": "global_volume_accumulator",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  108,
                  111,
                  98,
                  97,
                  108,
                  95,
                  118,
                  111,
                  108,
                  117,
                  109,
                  101,
                  95,
                  97,
                  99,
                  99,
                  117,
                  109,
                  117,
                  108,
                  97,
                  116,
                  111,
                  114
                ]
              }
            ]
          }
        },
        {
          "name": "user_volume_accumulator",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114,
                  95,
                  118,
                  111,
                  108,
                  117,
                  109,
                  101,
                  95,
                  97,
                  99,
                  99,
                  117,
                  109,
                  117,
                  108,
                  97,
                  116,
                  111,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "user"
              }
            ]
          }
        },
        {
          "name": "fee_config",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  102,
                  101,
                  101,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              },
              {
                "kind": "const",
                "value": [
                  12,
                  20,
                  222,
                  252,
                  130,
                  94,
                  198,
                  118,
                  148,
                  37,
                  8,
                  24,
                  187,
                  101,
                  64,
                  101,
                  244,
                  41,
                  141,
                  49,
                  86,
                  213,
                  113,
                  180,
                  212,
                  248,
                  9,
                  12,
                  24,
                  233,
                  168,
                  99
                ]
              }
            ],
            "program": {
              "kind": "account",
              "path": "fee_program"
            }
          }
        },
        {
          "name": "fee_program",
          "address": "pfeeUxB6jkeY1Hxd7CsFCAjcbHA9rWtchMGdZ6VojVZ"
        }
      ],
      "args": [
        {
          "name": "base_amount_out",
          "type": "u64"
        },
        {
          "name": "max_quote_amount_in",
          "type": "u64"
        },
        {
          "name": "track_volume",
          "type": {
            "defined": {
              "name": "OptionBool"
            }
          }
        }
      ]
    },
    {
      "name": "buy_exact_quote_in",
      "docs": [
        "Given a budget of spendable_quote_in, buy at least min_base_amount_out",
        "Fees will be deducted from spendable_quote_in",
        "",
        "f(quote) = tokens, where tokens >= min_base_amount_out",
        "",
        "Make sure the payer has enough SOL to cover creation of the following accounts (unless already created):",
        "- protocol_fee_recipient_token_account: rent.minimum_balance(TokenAccount::LEN)",
        "- coin_creator_vault_ata: rent.minimum_balance(TokenAccount::LEN)",
        "- user_volume_accumulator: rent.minimum_balance(UserVolumeAccumulator::LEN)",
        "",
        "For cashback coins, optionally pass user_volume_accumulator_wsol_ata as remaining_accounts[0].",
        "If provided and valid, the ATA will be initialized if needed."
      ],
      "discriminator": [
        198,
        46,
        21,
        82,
        180,
        217,
        232,
        112
      ],
      "accounts": [
        {
          "name": "pool",
          "writable": true
        },
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "global_config"
        },
        {
          "name": "base_mint",
          "relations": [
            "pool"
          ]
        },
        {
          "name": "quote_mint",
          "relations": [
            "pool"
          ]
        },
        {
          "name": "user_base_token_account",
          "writable": true
        },
        {
          "name": "user_quote_token_account",
          "writable": true
        },
        {
          "name": "pool_base_token_account",
          "writable": true,
          "relations": [
            "pool"
          ]
        },
        {
          "name": "pool_quote_token_account",
          "writable": true,
          "relations": [
            "pool"
          ]
        },
        {
          "name": "protocol_fee_recipient"
        },
        {
          "name": "protocol_fee_recipient_token_account",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "protocol_fee_recipient"
              },
              {
                "kind": "account",
                "path": "quote_token_program"
              },
              {
                "kind": "account",
                "path": "quote_mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "base_token_program"
        },
        {
          "name": "quote_token_program"
        },
        {
          "name": "system_program",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "associated_token_program",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "event_authority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  95,
                  95,
                  101,
                  118,
                  101,
                  110,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "program",
          "address": "pAMMBay6oceH9fJKBRHGP5D4bD4sWpmSwMn52FMfXEA"
        },
        {
          "name": "coin_creator_vault_ata",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "coin_creator_vault_authority"
              },
              {
                "kind": "account",
                "path": "quote_token_program"
              },
              {
                "kind": "account",
                "path": "quote_mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "coin_creator_vault_authority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  114,
                  101,
                  97,
                  116,
                  111,
                  114,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "pool.coin_creator",
                "account": "Pool"
              }
            ]
          }
        },
        {
          "name": "global_volume_accumulator",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  108,
                  111,
                  98,
                  97,
                  108,
                  95,
                  118,
                  111,
                  108,
                  117,
                  109,
                  101,
                  95,
                  97,
                  99,
                  99,
                  117,
                  109,
                  117,
                  108,
                  97,
                  116,
                  111,
                  114
                ]
              }
            ]
          }
        },
        {
          "name": "user_volume_accumulator",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114,
                  95,
                  118,
                  111,
                  108,
                  117,
                  109,
                  101,
                  95,
                  97,
                  99,
                  99,
                  117,
                  109,
                  117,
                  108,
                  97,
                  116,
                  111,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "user"
              }
            ]
          }
        },
        {
          "name": "fee_config",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  102,
                  101,
                  101,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              },
              {
                "kind": "const",
                "value": [
                  12,
                  20,
                  222,
                  252,
                  130,
                  94,
                  198,
                  118,
                  148,
                  37,
                  8,
                  24,
                  187,
                  101,
                  64,
                  101,
                  244,
                  41,
                  141,
                  49,
                  86,
                  213,
                  113,
                  180,
                  212,
                  248,
                  9,
                  12,
                  24,
                  233,
                  168,
                  99
                ]
              }
            ],
            "program": {
              "kind": "account",
              "path": "fee_program"
            }
          }
        },
        {
          "name": "fee_program",
          "address": "pfeeUxB6jkeY1Hxd7CsFCAjcbHA9rWtchMGdZ6VojVZ"
        }
      ],
      "args": [
        {
          "name": "spendable_quote_in",
          "type": "u64"
        },
        {
          "name": "min_base_amount_out",
          "type": "u64"
        },
        {
          "name": "track_volume",
          "type": {
            "defined": {
              "name": "OptionBool"
            }
          }
        }
      ]
    },
    {
      "name": "buy_exact_quote_in_v2",
      "discriminator": [
        194,
        171,
        28,
        70,
        104,
        77,
        91,
        47
      ],
      "accounts": [
        {
          "name": "pool",
          "writable": true
        },
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "global_config"
        },
        {
          "name": "base_mint",
          "relations": [
            "pool"
          ]
        },
        {
          "name": "quote_mint",
          "relations": [
            "pool"
          ]
        },
        {
          "name": "user_base_token_account",
          "writable": true
        },
        {
          "name": "user_quote_token_account",
          "writable": true
        },
        {
          "name": "pool_base_token_account",
          "writable": true,
          "relations": [
            "pool"
          ]
        },
        {
          "name": "pool_quote_token_account",
          "writable": true,
          "relations": [
            "pool"
          ]
        },
        {
          "name": "base_token_program"
        },
        {
          "name": "quote_token_program"
        },
        {
          "name": "system_program",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "user_volume_accumulator",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114,
                  95,
                  118,
                  111,
                  108,
                  117,
                  109,
                  101,
                  95,
                  97,
                  99,
                  99,
                  117,
                  109,
                  117,
                  108,
                  97,
                  116,
                  111,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "user"
              }
            ]
          }
        },
        {
          "name": "fee_config",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  102,
                  101,
                  101,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              },
              {
                "kind": "const",
                "value": [
                  12,
                  20,
                  222,
                  252,
                  130,
                  94,
                  198,
                  118,
                  148,
                  37,
                  8,
                  24,
                  187,
                  101,
                  64,
                  101,
                  244,
                  41,
                  141,
                  49,
                  86,
                  213,
                  113,
                  180,
                  212,
                  248,
                  9,
                  12,
                  24,
                  233,
                  168,
                  99
                ]
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                12,
                53,
                255,
                169,
                5,
                90,
                142,
                86,
                141,
                168,
                247,
                188,
                7,
                86,
                21,
                39,
                76,
                241,
                201,
                44,
                164,
                31,
                64,
                0,
                156,
                81,
                106,
                164,
                20,
                194,
                124,
                112
              ]
            }
          }
        },
        {
          "name": "buyback_fee_recipient",
          "writable": true
        },
        {
          "name": "event_authority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  95,
                  95,
                  101,
                  118,
                  101,
                  110,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "program",
          "address": "pAMMBay6oceH9fJKBRHGP5D4bD4sWpmSwMn52FMfXEA"
        }
      ],
      "args": [
        {
          "name": "spendable_quote_in",
          "type": "u64"
        },
        {
          "name": "min_base_amount_out",
          "type": "u64"
        }
      ]
    },
    {
      "name": "buy_v2",
      "discriminator": [
        184,
        23,
        238,
        97,
        103,
        197,
        211,
        61
      ],
      "accounts": [
        {
          "name": "pool",
          "writable": true
        },
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "global_config"
        },
        {
          "name": "base_mint",
          "relations": [
            "pool"
          ]
        },
        {
          "name": "quote_mint",
          "relations": [
            "pool"
          ]
        },
        {
          "name": "user_base_token_account",
          "writable": true
        },
        {
          "name": "user_quote_token_account",
          "writable": true
        },
        {
          "name": "pool_base_token_account",
          "writable": true,
          "relations": [
            "pool"
          ]
        },
        {
          "name": "pool_quote_token_account",
          "writable": true,
          "relations": [
            "pool"
          ]
        },
        {
          "name": "base_token_program"
        },
        {
          "name": "quote_token_program"
        },
        {
          "name": "system_program",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "user_volume_accumulator",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114,
                  95,
                  118,
                  111,
                  108,
                  117,
                  109,
                  101,
                  95,
                  97,
                  99,
                  99,
                  117,
                  109,
                  117,
                  108,
                  97,
                  116,
                  111,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "user"
              }
            ]
          }
        },
        {
          "name": "fee_config",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  102,
                  101,
                  101,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              },
              {
                "kind": "const",
                "value": [
                  12,
                  20,
                  222,
                  252,
                  130,
                  94,
                  198,
                  118,
                  148,
                  37,
                  8,
                  24,
                  187,
                  101,
                  64,
                  101,
                  244,
                  41,
                  141,
                  49,
                  86,
                  213,
                  113,
                  180,
                  212,
                  248,
                  9,
                  12,
                  24,
                  233,
                  168,
                  99
                ]
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                12,
                53,
                255,
                169,
                5,
                90,
                142,
                86,
                141,
                168,
                247,
                188,
                7,
                86,
                21,
                39,
                76,
                241,
                201,
                44,
                164,
                31,
                64,
                0,
                156,
                81,
                106,
                164,
                20,
                194,
                124,
                112
              ]
            }
          }
        },
        {
          "name": "buyback_fee_recipient",
          "writable": true
        },
        {
          "name": "event_authority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  95,
                  95,
                  101,
                  118,
                  101,
                  110,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "program",
          "address": "pAMMBay6oceH9fJKBRHGP5D4bD4sWpmSwMn52FMfXEA"
        }
      ],
      "args": [
        {
          "name": "base_amount_out",
          "type": "u64"
        },
        {
          "name": "max_quote_amount_in",
          "type": "u64"
        }
      ]
    },
    {
      "name": "claim_cashback",
      "docs": [
        "Pays out the user's accrued cashback. `user_wsol_token_account` may be any token account",
        "of `quote_mint` owned by `user`, not only the associated one."
      ],
      "discriminator": [
        37,
        58,
        35,
        126,
        190,
        53,
        228,
        197
      ],
      "accounts": [
        {
          "name": "user",
          "writable": true
        },
        {
          "name": "user_volume_accumulator",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114,
                  95,
                  118,
                  111,
                  108,
                  117,
                  109,
                  101,
                  95,
                  97,
                  99,
                  99,
                  117,
                  109,
                  117,
                  108,
                  97,
                  116,
                  111,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "user"
              }
            ]
          }
        },
        {
          "name": "quote_mint"
        },
        {
          "name": "quote_token_program"
        },
        {
          "name": "user_volume_accumulator_wsol_token_account",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "user_volume_accumulator"
              },
              {
                "kind": "account",
                "path": "quote_token_program"
              },
              {
                "kind": "account",
                "path": "quote_mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "user_wsol_token_account",
          "writable": true
        },
        {
          "name": "system_program",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "event_authority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  95,
                  95,
                  101,
                  118,
                  101,
                  110,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "program",
          "address": "pAMMBay6oceH9fJKBRHGP5D4bD4sWpmSwMn52FMfXEA"
        }
      ],
      "args": []
    },
    {
      "name": "claim_token_incentives",
      "discriminator": [
        16,
        4,
        71,
        28,
        204,
        1,
        40,
        27
      ],
      "accounts": [
        {
          "name": "user"
        },
        {
          "name": "user_ata",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "user"
              },
              {
                "kind": "account",
                "path": "token_program"
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "global_volume_accumulator",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  108,
                  111,
                  98,
                  97,
                  108,
                  95,
                  118,
                  111,
                  108,
                  117,
                  109,
                  101,
                  95,
                  97,
                  99,
                  99,
                  117,
                  109,
                  117,
                  108,
                  97,
                  116,
                  111,
                  114
                ]
              }
            ]
          }
        },
        {
          "name": "global_incentive_token_account",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "global_volume_accumulator"
              },
              {
                "kind": "account",
                "path": "token_program"
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "user_volume_accumulator",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114,
                  95,
                  118,
                  111,
                  108,
                  117,
                  109,
                  101,
                  95,
                  97,
                  99,
                  99,
                  117,
                  109,
                  117,
                  108,
                  97,
                  116,
                  111,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "user"
              }
            ]
          }
        },
        {
          "name": "mint",
          "relations": [
            "global_volume_accumulator"
          ]
        },
        {
          "name": "token_program"
        },
        {
          "name": "system_program",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "associated_token_program",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "event_authority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  95,
                  95,
                  101,
                  118,
                  101,
                  110,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "program",
          "address": "pAMMBay6oceH9fJKBRHGP5D4bD4sWpmSwMn52FMfXEA"
        },
        {
          "name": "payer",
          "writable": true,
          "signer": true
        }
      ],
      "args": []
    },
    {
      "name": "close_user_volume_accumulator",
      "discriminator": [
        249,
        69,
        164,
        218,
        150,
        103,
        84,
        138
      ],
      "accounts": [
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "user_volume_accumulator",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114,
                  95,
                  118,
                  111,
                  108,
                  117,
                  109,
                  101,
                  95,
                  97,
                  99,
                  99,
                  117,
                  109,
                  117,
                  108,
                  97,
                  116,
                  111,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "user"
              }
            ]
          }
        },
        {
          "name": "event_authority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  95,
                  95,
                  101,
                  118,
                  101,
                  110,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "program"
        }
      ],
      "args": []
    },
    {
      "name": "collect_coin_creator_fee",
      "discriminator": [
        160,
        57,
        89,
        42,
        181,
        139,
        43,
        66
      ],
      "accounts": [
        {
          "name": "quote_mint"
        },
        {
          "name": "quote_token_program"
        },
        {
          "name": "coin_creator"
        },
        {
          "name": "coin_creator_vault_authority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  114,
                  101,
                  97,
                  116,
                  111,
                  114,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "coin_creator"
              }
            ]
          }
        },
        {
          "name": "coin_creator_vault_ata",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "coin_creator_vault_authority"
              },
              {
                "kind": "account",
                "path": "quote_token_program"
              },
              {
                "kind": "account",
                "path": "quote_mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "coin_creator_token_account",
          "writable": true
        },
        {
          "name": "event_authority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  95,
                  95,
                  101,
                  118,
                  101,
                  110,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "program"
        }
      ],
      "args": []
    },
    {
      "name": "create_config",
      "discriminator": [
        201,
        207,
        243,
        114,
        75,
        111,
        47,
        189
      ],
      "accounts": [
        {
          "name": "admin",
          "writable": true,
          "signer": true,
          "address": "8LWu7QM2dGR1G8nKDHthckea57bkCzXyBTAKPJUBDHo8"
        },
        {
          "name": "global_config",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  108,
                  111,
                  98,
                  97,
                  108,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "system_program",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "event_authority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  95,
                  95,
                  101,
                  118,
                  101,
                  110,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "program"
        }
      ],
      "args": [
        {
          "name": "lp_fee_basis_points",
          "type": "u64"
        },
        {
          "name": "protocol_fee_basis_points",
          "type": "u64"
        },
        {
          "name": "protocol_fee_recipients",
          "type": {
            "array": [
              "pubkey",
              8
            ]
          }
        },
        {
          "name": "coin_creator_fee_basis_points",
          "type": "u64"
        },
        {
          "name": "admin_set_coin_creator_authority",
          "type": "pubkey"
        }
      ]
    },
    {
      "name": "create_pool",
      "discriminator": [
        233,
        146,
        209,
        142,
        207,
        104,
        64,
        188
      ],
      "accounts": [
        {
          "name": "pool",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  111,
                  111,
                  108
                ]
              },
              {
                "kind": "arg",
                "path": "index"
              },
              {
                "kind": "account",
                "path": "creator"
              },
              {
                "kind": "account",
                "path": "base_mint"
              },
              {
                "kind": "account",
                "path": "quote_mint"
              }
            ]
          }
        },
        {
          "name": "global_config"
        },
        {
          "name": "creator",
          "writable": true,
          "signer": true
        },
        {
          "name": "base_mint"
        },
        {
          "name": "quote_mint"
        },
        {
          "name": "lp_mint",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  111,
                  111,
                  108,
                  95,
                  108,
                  112,
                  95,
                  109,
                  105,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "pool"
              }
            ]
          }
        },
        {
          "name": "user_base_token_account",
          "writable": true
        },
        {
          "name": "user_quote_token_account",
          "writable": true
        },
        {
          "name": "user_pool_token_account",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "creator"
              },
              {
                "kind": "account",
                "path": "token_2022_program"
              },
              {
                "kind": "account",
                "path": "lp_mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "pool_base_token_account",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "pool"
              },
              {
                "kind": "account",
                "path": "base_token_program"
              },
              {
                "kind": "account",
                "path": "base_mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "pool_quote_token_account",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "pool"
              },
              {
                "kind": "account",
                "path": "quote_token_program"
              },
              {
                "kind": "account",
                "path": "quote_mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "system_program",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "token_2022_program",
          "address": "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb"
        },
        {
          "name": "base_token_program"
        },
        {
          "name": "quote_token_program"
        },
        {
          "name": "associated_token_program",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "event_authority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  95,
                  95,
                  101,
                  118,
                  101,
                  110,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "program"
        }
      ],
      "args": [
        {
          "name": "index",
          "type": "u16"
        },
        {
          "name": "base_amount_in",
          "type": "u64"
        },
        {
          "name": "quote_amount_in",
          "type": "u64"
        },
        {
          "name": "coin_creator",
          "type": "pubkey"
        },
        {
          "name": "is_mayhem_mode",
          "type": "bool"
        },
        {
          "name": "is_cashback_coin",
          "type": {
            "defined": {
              "name": "OptionBool"
            }
          }
        },
        {
          "name": "creator_fee_bps",
          "type": {
            "defined": {
              "name": "OptionU64"
            }
          }
        },
        {
          "name": "can_edit_creator_fee",
          "type": {
            "defined": {
              "name": "OptionBool"
            }
          }
        },
        {
          "name": "is_holder_reward",
          "type": {
            "defined": {
              "name": "OptionBool"
            }
          }
        }
      ]
    },
    {
      "name": "deposit",
      "discriminator": [
        242,
        35,
        198,
        137,
        82,
        225,
        242,
        182
      ],
      "accounts": [
        {
          "name": "pool",
          "writable": true
        },
        {
          "name": "global_config"
        },
        {
          "name": "user",
          "signer": true
        },
        {
          "name": "base_mint",
          "relations": [
            "pool"
          ]
        },
        {
          "name": "quote_mint",
          "relations": [
            "pool"
          ]
        },
        {
          "name": "lp_mint",
          "writable": true,
          "relations": [
            "pool"
          ]
        },
        {
          "name": "user_base_token_account",
          "writable": true
        },
        {
          "name": "user_quote_token_account",
          "writable": true
        },
        {
          "name": "user_pool_token_account",
          "writable": true
        },
        {
          "name": "pool_base_token_account",
          "writable": true,
          "relations": [
            "pool"
          ]
        },
        {
          "name": "pool_quote_token_account",
          "writable": true,
          "relations": [
            "pool"
          ]
        },
        {
          "name": "token_program",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "token_2022_program",
          "address": "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb"
        },
        {
          "name": "event_authority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  95,
                  95,
                  101,
                  118,
                  101,
                  110,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "program"
        }
      ],
      "args": [
        {
          "name": "lp_token_amount_out",
          "type": "u64"
        },
        {
          "name": "max_base_amount_in",
          "type": "u64"
        },
        {
          "name": "max_quote_amount_in",
          "type": "u64"
        }
      ]
    },
    {
      "name": "disable",
      "discriminator": [
        185,
        173,
        187,
        90,
        216,
        15,
        238,
        233
      ],
      "accounts": [
        {
          "name": "admin",
          "signer": true,
          "relations": [
            "global_config"
          ]
        },
        {
          "name": "global_config",
          "writable": true
        },
        {
          "name": "event_authority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  95,
                  95,
                  101,
                  118,
                  101,
                  110,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "program"
        }
      ],
      "args": [
        {
          "name": "disable_create_pool",
          "type": "bool"
        },
        {
          "name": "disable_deposit",
          "type": "bool"
        },
        {
          "name": "disable_withdraw",
          "type": "bool"
        },
        {
          "name": "disable_buy",
          "type": "bool"
        },
        {
          "name": "disable_sell",
          "type": "bool"
        }
      ]
    },
    {
      "name": "extend_account",
      "discriminator": [
        234,
        102,
        194,
        203,
        150,
        72,
        62,
        229
      ],
      "accounts": [
        {
          "name": "account",
          "writable": true
        },
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "system_program",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "event_authority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  95,
                  95,
                  101,
                  118,
                  101,
                  110,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "program"
        }
      ],
      "args": []
    },
    {
      "name": "init_boost",
      "discriminator": [
        140,
        233,
        33,
        94,
        132,
        90,
        194,
        143
      ],
      "accounts": [
        {
          "name": "pool",
          "writable": true
        },
        {
          "name": "global_config",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  108,
                  111,
                  98,
                  97,
                  108,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "creator",
          "writable": true,
          "signer": true
        },
        {
          "name": "base_mint",
          "relations": [
            "pool"
          ]
        },
        {
          "name": "quote_mint",
          "relations": [
            "pool"
          ]
        },
        {
          "name": "pool_base_token_account",
          "relations": [
            "pool"
          ]
        },
        {
          "name": "pool_quote_token_account",
          "writable": true,
          "relations": [
            "pool"
          ]
        },
        {
          "name": "boost_vault_authority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  111,
                  111,
                  115,
                  116,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "pool"
              }
            ]
          }
        },
        {
          "name": "boost_vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "boost_vault_authority"
              },
              {
                "kind": "account",
                "path": "quote_token_program"
              },
              {
                "kind": "account",
                "path": "quote_mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "quote_token_program"
        },
        {
          "name": "system_program",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "associated_token_program",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "event_authority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  95,
                  95,
                  101,
                  118,
                  101,
                  110,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "program"
        }
      ],
      "args": []
    },
    {
      "name": "init_user_volume_accumulator",
      "discriminator": [
        94,
        6,
        202,
        115,
        255,
        96,
        232,
        183
      ],
      "accounts": [
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "user"
        },
        {
          "name": "user_volume_accumulator",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114,
                  95,
                  118,
                  111,
                  108,
                  117,
                  109,
                  101,
                  95,
                  97,
                  99,
                  99,
                  117,
                  109,
                  117,
                  108,
                  97,
                  116,
                  111,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "user"
              }
            ]
          }
        },
        {
          "name": "system_program",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "event_authority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  95,
                  95,
                  101,
                  118,
                  101,
                  110,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "program"
        }
      ],
      "args": []
    },
    {
      "name": "migrate_pool_coin_creator",
      "docs": [
        "Migrate Pool Coin Creator to Sharing Config"
      ],
      "discriminator": [
        208,
        8,
        159,
        4,
        74,
        175,
        16,
        58
      ],
      "accounts": [
        {
          "name": "pool",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  111,
                  111,
                  108
                ]
              },
              {
                "kind": "account",
                "path": "pool.index",
                "account": "Pool"
              },
              {
                "kind": "account",
                "path": "pool.creator",
                "account": "Pool"
              },
              {
                "kind": "account",
                "path": "pool.base_mint",
                "account": "Pool"
              },
              {
                "kind": "account",
                "path": "pool.quote_mint",
                "account": "Pool"
              }
            ]
          }
        },
        {
          "name": "sharing_config",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  104,
                  97,
                  114,
                  105,
                  110,
                  103,
                  45,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              },
              {
                "kind": "account",
                "path": "pool.base_mint",
                "account": "Pool"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                12,
                53,
                255,
                169,
                5,
                90,
                142,
                86,
                141,
                168,
                247,
                188,
                7,
                86,
                21,
                39,
                76,
                241,
                201,
                44,
                164,
                31,
                64,
                0,
                156,
                81,
                106,
                164,
                20,
                194,
                124,
                112
              ]
            }
          }
        },
        {
          "name": "event_authority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  95,
                  95,
                  101,
                  118,
                  101,
                  110,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "program"
        }
      ],
      "args": []
    },
    {
      "name": "multi_hop_swap",
      "discriminator": [
        43,
        100,
        73,
        19,
        233,
        246,
        111,
        148
      ],
      "accounts": [
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "user_in_token_account",
          "writable": true
        },
        {
          "name": "user_out_token_account",
          "writable": true
        },
        {
          "name": "global_config",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  108,
                  111,
                  98,
                  97,
                  108,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "fee_config",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  102,
                  101,
                  101,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              },
              {
                "kind": "const",
                "value": [
                  12,
                  20,
                  222,
                  252,
                  130,
                  94,
                  198,
                  118,
                  148,
                  37,
                  8,
                  24,
                  187,
                  101,
                  64,
                  101,
                  244,
                  41,
                  141,
                  49,
                  86,
                  213,
                  113,
                  180,
                  212,
                  248,
                  9,
                  12,
                  24,
                  233,
                  168,
                  99
                ]
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                12,
                53,
                255,
                169,
                5,
                90,
                142,
                86,
                141,
                168,
                247,
                188,
                7,
                86,
                21,
                39,
                76,
                241,
                201,
                44,
                164,
                31,
                64,
                0,
                156,
                81,
                106,
                164,
                20,
                194,
                124,
                112
              ]
            }
          }
        },
        {
          "name": "user_volume_accumulator",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114,
                  95,
                  118,
                  111,
                  108,
                  117,
                  109,
                  101,
                  95,
                  97,
                  99,
                  99,
                  117,
                  109,
                  117,
                  108,
                  97,
                  116,
                  111,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "user"
              }
            ]
          }
        },
        {
          "name": "buyback_fee_recipient",
          "writable": true
        },
        {
          "name": "token_program",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "token_2022_program",
          "address": "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb"
        },
        {
          "name": "system_program",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "event_authority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  95,
                  95,
                  101,
                  118,
                  101,
                  110,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "program",
          "address": "pAMMBay6oceH9fJKBRHGP5D4bD4sWpmSwMn52FMfXEA"
        },
        {
          "name": "pump_program",
          "address": "6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P"
        },
        {
          "name": "pump_global"
        },
        {
          "name": "pump_fee_config"
        },
        {
          "name": "pump_event_authority"
        }
      ],
      "args": [
        {
          "name": "amount_in",
          "type": "u64"
        },
        {
          "name": "min_amount_out",
          "type": "u64"
        }
      ]
    },
    {
      "name": "sell",
      "discriminator": [
        51,
        230,
        133,
        164,
        1,
        127,
        131,
        173
      ],
      "accounts": [
        {
          "name": "pool",
          "writable": true
        },
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "global_config"
        },
        {
          "name": "base_mint",
          "relations": [
            "pool"
          ]
        },
        {
          "name": "quote_mint",
          "relations": [
            "pool"
          ]
        },
        {
          "name": "user_base_token_account",
          "writable": true
        },
        {
          "name": "user_quote_token_account",
          "writable": true
        },
        {
          "name": "pool_base_token_account",
          "writable": true,
          "relations": [
            "pool"
          ]
        },
        {
          "name": "pool_quote_token_account",
          "writable": true,
          "relations": [
            "pool"
          ]
        },
        {
          "name": "protocol_fee_recipient"
        },
        {
          "name": "protocol_fee_recipient_token_account",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "protocol_fee_recipient"
              },
              {
                "kind": "account",
                "path": "quote_token_program"
              },
              {
                "kind": "account",
                "path": "quote_mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "base_token_program"
        },
        {
          "name": "quote_token_program"
        },
        {
          "name": "system_program",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "associated_token_program",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "event_authority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  95,
                  95,
                  101,
                  118,
                  101,
                  110,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "program",
          "address": "pAMMBay6oceH9fJKBRHGP5D4bD4sWpmSwMn52FMfXEA"
        },
        {
          "name": "coin_creator_vault_ata",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "coin_creator_vault_authority"
              },
              {
                "kind": "account",
                "path": "quote_token_program"
              },
              {
                "kind": "account",
                "path": "quote_mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "coin_creator_vault_authority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  114,
                  101,
                  97,
                  116,
                  111,
                  114,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "pool.coin_creator",
                "account": "Pool"
              }
            ]
          }
        },
        {
          "name": "fee_config",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  102,
                  101,
                  101,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              },
              {
                "kind": "const",
                "value": [
                  12,
                  20,
                  222,
                  252,
                  130,
                  94,
                  198,
                  118,
                  148,
                  37,
                  8,
                  24,
                  187,
                  101,
                  64,
                  101,
                  244,
                  41,
                  141,
                  49,
                  86,
                  213,
                  113,
                  180,
                  212,
                  248,
                  9,
                  12,
                  24,
                  233,
                  168,
                  99
                ]
              }
            ],
            "program": {
              "kind": "account",
              "path": "fee_program"
            }
          }
        },
        {
          "name": "fee_program",
          "address": "pfeeUxB6jkeY1Hxd7CsFCAjcbHA9rWtchMGdZ6VojVZ"
        }
      ],
      "args": [
        {
          "name": "base_amount_in",
          "type": "u64"
        },
        {
          "name": "min_quote_amount_out",
          "type": "u64"
        }
      ]
    },
    {
      "name": "sell_v2",
      "discriminator": [
        93,
        246,
        130,
        60,
        231,
        233,
        64,
        178
      ],
      "accounts": [
        {
          "name": "pool",
          "writable": true
        },
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "global_config"
        },
        {
          "name": "base_mint",
          "relations": [
            "pool"
          ]
        },
        {
          "name": "quote_mint",
          "relations": [
            "pool"
          ]
        },
        {
          "name": "user_base_token_account",
          "writable": true
        },
        {
          "name": "user_quote_token_account",
          "writable": true
        },
        {
          "name": "pool_base_token_account",
          "writable": true,
          "relations": [
            "pool"
          ]
        },
        {
          "name": "pool_quote_token_account",
          "writable": true,
          "relations": [
            "pool"
          ]
        },
        {
          "name": "base_token_program"
        },
        {
          "name": "quote_token_program"
        },
        {
          "name": "system_program",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "user_volume_accumulator",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114,
                  95,
                  118,
                  111,
                  108,
                  117,
                  109,
                  101,
                  95,
                  97,
                  99,
                  99,
                  117,
                  109,
                  117,
                  108,
                  97,
                  116,
                  111,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "user"
              }
            ]
          }
        },
        {
          "name": "fee_config",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  102,
                  101,
                  101,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              },
              {
                "kind": "const",
                "value": [
                  12,
                  20,
                  222,
                  252,
                  130,
                  94,
                  198,
                  118,
                  148,
                  37,
                  8,
                  24,
                  187,
                  101,
                  64,
                  101,
                  244,
                  41,
                  141,
                  49,
                  86,
                  213,
                  113,
                  180,
                  212,
                  248,
                  9,
                  12,
                  24,
                  233,
                  168,
                  99
                ]
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                12,
                53,
                255,
                169,
                5,
                90,
                142,
                86,
                141,
                168,
                247,
                188,
                7,
                86,
                21,
                39,
                76,
                241,
                201,
                44,
                164,
                31,
                64,
                0,
                156,
                81,
                106,
                164,
                20,
                194,
                124,
                112
              ]
            }
          }
        },
        {
          "name": "buyback_fee_recipient",
          "writable": true
        },
        {
          "name": "event_authority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  95,
                  95,
                  101,
                  118,
                  101,
                  110,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "program",
          "address": "pAMMBay6oceH9fJKBRHGP5D4bD4sWpmSwMn52FMfXEA"
        }
      ],
      "args": [
        {
          "name": "base_amount_in",
          "type": "u64"
        },
        {
          "name": "min_quote_amount_out",
          "type": "u64"
        }
      ]
    },
    {
      "name": "set_boost_authority",
      "discriminator": [
        227,
        149,
        76,
        42,
        130,
        39,
        234,
        205
      ],
      "accounts": [
        {
          "name": "admin",
          "signer": true,
          "relations": [
            "global_config"
          ]
        },
        {
          "name": "global_config",
          "writable": true
        },
        {
          "name": "boost_authority"
        },
        {
          "name": "system_program",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "event_authority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  95,
                  95,
                  101,
                  118,
                  101,
                  110,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "program"
        }
      ],
      "args": []
    },
    {
      "name": "set_coin_creator",
      "docs": [
        "Sets Pool::coin_creator from Metaplex metadata creator or BondingCurve::creator"
      ],
      "discriminator": [
        210,
        149,
        128,
        45,
        188,
        58,
        78,
        175
      ],
      "accounts": [
        {
          "name": "pool",
          "writable": true
        },
        {
          "name": "metadata",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  101,
                  116,
                  97,
                  100,
                  97,
                  116,
                  97
                ]
              },
              {
                "kind": "const",
                "value": [
                  11,
                  112,
                  101,
                  177,
                  227,
                  209,
                  124,
                  69,
                  56,
                  157,
                  82,
                  127,
                  107,
                  4,
                  195,
                  205,
                  88,
                  184,
                  108,
                  115,
                  26,
                  160,
                  253,
                  181,
                  73,
                  182,
                  209,
                  188,
                  3,
                  248,
                  41,
                  70
                ]
              },
              {
                "kind": "account",
                "path": "pool.base_mint",
                "account": "Pool"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                11,
                112,
                101,
                177,
                227,
                209,
                124,
                69,
                56,
                157,
                82,
                127,
                107,
                4,
                195,
                205,
                88,
                184,
                108,
                115,
                26,
                160,
                253,
                181,
                73,
                182,
                209,
                188,
                3,
                248,
                41,
                70
              ]
            }
          }
        },
        {
          "name": "bonding_curve",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  111,
                  110,
                  100,
                  105,
                  110,
                  103,
                  45,
                  99,
                  117,
                  114,
                  118,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "pool.base_mint",
                "account": "Pool"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                1,
                86,
                224,
                246,
                147,
                102,
                90,
                207,
                68,
                219,
                21,
                104,
                191,
                23,
                91,
                170,
                81,
                137,
                203,
                151,
                245,
                210,
                255,
                59,
                101,
                93,
                43,
                182,
                253,
                109,
                24,
                176
              ]
            }
          }
        },
        {
          "name": "event_authority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  95,
                  95,
                  101,
                  118,
                  101,
                  110,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "program"
        }
      ],
      "args": []
    },
    {
      "name": "set_reserved_fee_recipients",
      "discriminator": [
        111,
        172,
        162,
        232,
        114,
        89,
        213,
        142
      ],
      "accounts": [
        {
          "name": "global_config",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  108,
                  111,
                  98,
                  97,
                  108,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "admin",
          "signer": true,
          "relations": [
            "global_config"
          ]
        },
        {
          "name": "event_authority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  95,
                  95,
                  101,
                  118,
                  101,
                  110,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "program"
        }
      ],
      "args": [
        {
          "name": "whitelist_pda",
          "type": "pubkey"
        }
      ]
    },
    {
      "name": "sweep_creator_fee",
      "discriminator": [
        32,
        246,
        191,
        52,
        8,
        201,
        73,
        186
      ],
      "accounts": [
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "global_config"
        },
        {
          "name": "pool",
          "writable": true
        },
        {
          "name": "quote_mint",
          "relations": [
            "pool"
          ]
        },
        {
          "name": "quote_token_program"
        },
        {
          "name": "pool_quote_token_account",
          "writable": true,
          "relations": [
            "pool"
          ]
        },
        {
          "name": "recipient",
          "docs": [
            "protocol fee recipient (`check_protocol_fee_recipient`) or the coin-creator vault",
            "authority PDA of `pool.coin_creator`."
          ]
        },
        {
          "name": "recipient_token_account",
          "docs": [
            "idempotently when missing (the payer pays)."
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "recipient"
              },
              {
                "kind": "account",
                "path": "quote_token_program"
              },
              {
                "kind": "account",
                "path": "quote_mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "system_program",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "associated_token_program",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "event_authority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  95,
                  95,
                  101,
                  118,
                  101,
                  110,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "program"
        }
      ],
      "args": []
    },
    {
      "name": "sweep_protocol_fee",
      "discriminator": [
        8,
        48,
        190,
        7,
        182,
        68,
        183,
        229
      ],
      "accounts": [
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "global_config"
        },
        {
          "name": "pool",
          "writable": true
        },
        {
          "name": "quote_mint",
          "relations": [
            "pool"
          ]
        },
        {
          "name": "quote_token_program"
        },
        {
          "name": "pool_quote_token_account",
          "writable": true,
          "relations": [
            "pool"
          ]
        },
        {
          "name": "recipient",
          "docs": [
            "protocol fee recipient (`check_protocol_fee_recipient`) or the coin-creator vault",
            "authority PDA of `pool.coin_creator`."
          ]
        },
        {
          "name": "recipient_token_account",
          "docs": [
            "idempotently when missing (the payer pays)."
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "recipient"
              },
              {
                "kind": "account",
                "path": "quote_token_program"
              },
              {
                "kind": "account",
                "path": "quote_mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "system_program",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "associated_token_program",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "event_authority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  95,
                  95,
                  101,
                  118,
                  101,
                  110,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "program"
        }
      ],
      "args": []
    },
    {
      "name": "sync_user_volume_accumulator",
      "discriminator": [
        86,
        31,
        192,
        87,
        163,
        87,
        79,
        238
      ],
      "accounts": [
        {
          "name": "user"
        },
        {
          "name": "global_volume_accumulator",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  108,
                  111,
                  98,
                  97,
                  108,
                  95,
                  118,
                  111,
                  108,
                  117,
                  109,
                  101,
                  95,
                  97,
                  99,
                  99,
                  117,
                  109,
                  117,
                  108,
                  97,
                  116,
                  111,
                  114
                ]
              }
            ]
          }
        },
        {
          "name": "user_volume_accumulator",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114,
                  95,
                  118,
                  111,
                  108,
                  117,
                  109,
                  101,
                  95,
                  97,
                  99,
                  99,
                  117,
                  109,
                  117,
                  108,
                  97,
                  116,
                  111,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "user"
              }
            ]
          }
        },
        {
          "name": "event_authority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  95,
                  95,
                  101,
                  118,
                  101,
                  110,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "program"
        }
      ],
      "args": []
    },
    {
      "name": "toggle_boost",
      "discriminator": [
        117,
        161,
        160,
        74,
        223,
        137,
        118,
        99
      ],
      "accounts": [
        {
          "name": "admin",
          "signer": true,
          "relations": [
            "global_config"
          ]
        },
        {
          "name": "global_config",
          "writable": true
        }
      ],
      "args": [
        {
          "name": "enabled",
          "type": "bool"
        }
      ]
    },
    {
      "name": "toggle_cashback_enabled",
      "discriminator": [
        115,
        103,
        224,
        255,
        189,
        89,
        86,
        195
      ],
      "accounts": [
        {
          "name": "admin",
          "signer": true,
          "relations": [
            "global_config"
          ]
        },
        {
          "name": "global_config",
          "writable": true
        },
        {
          "name": "event_authority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  95,
                  95,
                  101,
                  118,
                  101,
                  110,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "program"
        }
      ],
      "args": [
        {
          "name": "enabled",
          "type": "bool"
        }
      ]
    },
    {
      "name": "toggle_mayhem_mode",
      "discriminator": [
        1,
        9,
        111,
        208,
        100,
        31,
        255,
        163
      ],
      "accounts": [
        {
          "name": "admin",
          "signer": true,
          "relations": [
            "global_config"
          ]
        },
        {
          "name": "global_config",
          "writable": true
        },
        {
          "name": "event_authority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  95,
                  95,
                  101,
                  118,
                  101,
                  110,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "program"
        }
      ],
      "args": [
        {
          "name": "enabled",
          "type": "bool"
        }
      ]
    },
    {
      "name": "transfer_creator_fees_to_pump",
      "docs": [
        "Transfer creator fees to pump creator vault",
        "If coin creator fees are currently below rent.minimum_balance(TokenAccount::LEN)",
        "The transfer will be skipped"
      ],
      "discriminator": [
        139,
        52,
        134,
        85,
        228,
        229,
        108,
        241
      ],
      "accounts": [
        {
          "name": "wsol_mint",
          "docs": [
            "Pump Canonical Pool are quoted in wSOL"
          ]
        },
        {
          "name": "token_program"
        },
        {
          "name": "system_program",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "associated_token_program",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "coin_creator"
        },
        {
          "name": "coin_creator_vault_authority",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  114,
                  101,
                  97,
                  116,
                  111,
                  114,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "coin_creator"
              }
            ]
          }
        },
        {
          "name": "coin_creator_vault_ata",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "coin_creator_vault_authority"
              },
              {
                "kind": "account",
                "path": "token_program"
              },
              {
                "kind": "account",
                "path": "wsol_mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "pump_creator_vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  114,
                  101,
                  97,
                  116,
                  111,
                  114,
                  45,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "coin_creator"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                1,
                86,
                224,
                246,
                147,
                102,
                90,
                207,
                68,
                219,
                21,
                104,
                191,
                23,
                91,
                170,
                81,
                137,
                203,
                151,
                245,
                210,
                255,
                59,
                101,
                93,
                43,
                182,
                253,
                109,
                24,
                176
              ]
            }
          }
        },
        {
          "name": "event_authority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  95,
                  95,
                  101,
                  118,
                  101,
                  110,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "program"
        }
      ],
      "args": []
    },
    {
      "name": "transfer_creator_fees_to_pump_v2",
      "discriminator": [
        1,
        33,
        78,
        185,
        33,
        67,
        44,
        92
      ],
      "accounts": [
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "quote_mint"
        },
        {
          "name": "token_program"
        },
        {
          "name": "system_program",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "associated_token_program",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "coin_creator"
        },
        {
          "name": "coin_creator_vault_authority",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  114,
                  101,
                  97,
                  116,
                  111,
                  114,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "coin_creator"
              }
            ]
          }
        },
        {
          "name": "coin_creator_vault_ata",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "coin_creator_vault_authority"
              },
              {
                "kind": "account",
                "path": "token_program"
              },
              {
                "kind": "account",
                "path": "quote_mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "pump_creator_vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  114,
                  101,
                  97,
                  116,
                  111,
                  114,
                  45,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "coin_creator"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                1,
                86,
                224,
                246,
                147,
                102,
                90,
                207,
                68,
                219,
                21,
                104,
                191,
                23,
                91,
                170,
                81,
                137,
                203,
                151,
                245,
                210,
                255,
                59,
                101,
                93,
                43,
                182,
                253,
                109,
                24,
                176
              ]
            }
          }
        },
        {
          "name": "pump_creator_vault_ata",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "pump_creator_vault"
              },
              {
                "kind": "account",
                "path": "token_program"
              },
              {
                "kind": "account",
                "path": "quote_mint"
              }
            ],
            "program": {
              "kind": "account",
              "path": "associated_token_program"
            }
          }
        },
        {
          "name": "event_authority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  95,
                  95,
                  101,
                  118,
                  101,
                  110,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "program"
        }
      ],
      "args": []
    },
    {
      "name": "update_admin",
      "discriminator": [
        161,
        176,
        40,
        213,
        60,
        184,
        179,
        228
      ],
      "accounts": [
        {
          "name": "admin",
          "signer": true,
          "relations": [
            "global_config"
          ]
        },
        {
          "name": "global_config",
          "writable": true
        },
        {
          "name": "new_admin"
        },
        {
          "name": "event_authority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  95,
                  95,
                  101,
                  118,
                  101,
                  110,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "program"
        }
      ],
      "args": []
    },
    {
      "name": "update_buyback_config",
      "discriminator": [
        251,
        224,
        171,
        146,
        160,
        26,
        113,
        233
      ],
      "accounts": [
        {
          "name": "admin",
          "signer": true,
          "relations": [
            "global_config"
          ]
        },
        {
          "name": "global_config",
          "writable": true
        },
        {
          "name": "event_authority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  95,
                  95,
                  101,
                  118,
                  101,
                  110,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "program"
        }
      ],
      "args": [
        {
          "name": "buyback_basis_points",
          "type": {
            "option": "u64"
          }
        }
      ]
    },
    {
      "name": "update_creator_fee_config",
      "discriminator": [
        61,
        175,
        160,
        249,
        66,
        66,
        136,
        175
      ],
      "accounts": [
        {
          "name": "admin",
          "writable": true,
          "signer": true,
          "relations": [
            "global_config"
          ]
        },
        {
          "name": "global_config",
          "writable": true
        },
        {
          "name": "system_program",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "event_authority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  95,
                  95,
                  101,
                  118,
                  101,
                  110,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "program"
        }
      ],
      "args": [
        {
          "name": "creator_fee_configurable",
          "type": "bool"
        },
        {
          "name": "max_configurable_creator_fee_bps",
          "type": "u64"
        }
      ]
    },
    {
      "name": "update_fee_config",
      "discriminator": [
        104,
        184,
        103,
        242,
        88,
        151,
        107,
        20
      ],
      "accounts": [
        {
          "name": "admin",
          "signer": true,
          "relations": [
            "global_config"
          ]
        },
        {
          "name": "global_config",
          "writable": true
        },
        {
          "name": "event_authority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  95,
                  95,
                  101,
                  118,
                  101,
                  110,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "program"
        }
      ],
      "args": [
        {
          "name": "lp_fee_basis_points",
          "type": "u64"
        },
        {
          "name": "protocol_fee_basis_points",
          "type": "u64"
        },
        {
          "name": "protocol_fee_recipients",
          "type": {
            "array": [
              "pubkey",
              8
            ]
          }
        },
        {
          "name": "coin_creator_fee_basis_points",
          "type": "u64"
        },
        {
          "name": "admin_set_coin_creator_authority",
          "type": "pubkey"
        }
      ]
    },
    {
      "name": "withdraw",
      "discriminator": [
        183,
        18,
        70,
        156,
        148,
        109,
        161,
        34
      ],
      "accounts": [
        {
          "name": "pool",
          "writable": true
        },
        {
          "name": "global_config"
        },
        {
          "name": "user",
          "signer": true
        },
        {
          "name": "base_mint",
          "relations": [
            "pool"
          ]
        },
        {
          "name": "quote_mint",
          "relations": [
            "pool"
          ]
        },
        {
          "name": "lp_mint",
          "writable": true,
          "relations": [
            "pool"
          ]
        },
        {
          "name": "user_base_token_account",
          "writable": true
        },
        {
          "name": "user_quote_token_account",
          "writable": true
        },
        {
          "name": "user_pool_token_account",
          "writable": true
        },
        {
          "name": "pool_base_token_account",
          "writable": true,
          "relations": [
            "pool"
          ]
        },
        {
          "name": "pool_quote_token_account",
          "writable": true,
          "relations": [
            "pool"
          ]
        },
        {
          "name": "token_program",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "token_2022_program",
          "address": "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb"
        },
        {
          "name": "event_authority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  95,
                  95,
                  101,
                  118,
                  101,
                  110,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "program"
        }
      ],
      "args": [
        {
          "name": "lp_token_amount_in",
          "type": "u64"
        },
        {
          "name": "min_base_amount_out",
          "type": "u64"
        },
        {
          "name": "min_quote_amount_out",
          "type": "u64"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "BondingCurve",
      "discriminator": [
        23,
        183,
        248,
        55,
        96,
        216,
        172,
        96
      ]
    },
    {
      "name": "FeeConfig",
      "discriminator": [
        143,
        52,
        146,
        187,
        219,
        123,
        76,
        155
      ]
    },
    {
      "name": "GlobalConfig",
      "discriminator": [
        149,
        8,
        156,
        202,
        160,
        252,
        176,
        217
      ]
    },
    {
      "name": "GlobalVolumeAccumulator",
      "discriminator": [
        202,
        42,
        246,
        43,
        142,
        190,
        30,
        255
      ]
    },
    {
      "name": "Pool",
      "discriminator": [
        241,
        154,
        109,
        4,
        17,
        177,
        109,
        188
      ]
    },
    {
      "name": "SharingConfig",
      "discriminator": [
        216,
        74,
        9,
        0,
        56,
        140,
        93,
        75
      ]
    },
    {
      "name": "UserVolumeAccumulator",
      "discriminator": [
        86,
        255,
        112,
        14,
        102,
        53,
        154,
        250
      ]
    }
  ],
  "events": [
    {
      "name": "AdminCtoPoolEvent",
      "discriminator": [
        47,
        35,
        163,
        249,
        150,
        157,
        147,
        122
      ]
    },
    {
      "name": "AdminUpdateTokenIncentivesEvent",
      "discriminator": [
        147,
        250,
        108,
        120,
        247,
        29,
        67,
        222
      ]
    },
    {
      "name": "BoostBuyAndBurnEvent",
      "discriminator": [
        63,
        69,
        28,
        22,
        48,
        92,
        194,
        185
      ]
    },
    {
      "name": "BuyEvent",
      "discriminator": [
        103,
        244,
        82,
        31,
        44,
        245,
        119,
        119
      ]
    },
    {
      "name": "ClaimCashbackEvent",
      "discriminator": [
        226,
        214,
        246,
        33,
        7,
        242,
        147,
        229
      ]
    },
    {
      "name": "ClaimTokenIncentivesEvent",
      "discriminator": [
        79,
        172,
        246,
        49,
        205,
        91,
        206,
        232
      ]
    },
    {
      "name": "CloseUserVolumeAccumulatorEvent",
      "discriminator": [
        146,
        159,
        189,
        172,
        146,
        88,
        56,
        244
      ]
    },
    {
      "name": "CollectCoinCreatorFeeEvent",
      "discriminator": [
        232,
        245,
        194,
        238,
        234,
        218,
        58,
        89
      ]
    },
    {
      "name": "CreateConfigEvent",
      "discriminator": [
        107,
        52,
        89,
        129,
        55,
        226,
        81,
        22
      ]
    },
    {
      "name": "CreatePoolEvent",
      "discriminator": [
        177,
        49,
        12,
        210,
        160,
        118,
        167,
        116
      ]
    },
    {
      "name": "DepositEvent",
      "discriminator": [
        120,
        248,
        61,
        83,
        31,
        142,
        107,
        144
      ]
    },
    {
      "name": "DisableEvent",
      "discriminator": [
        107,
        253,
        193,
        76,
        228,
        202,
        27,
        104
      ]
    },
    {
      "name": "ExtendAccountEvent",
      "discriminator": [
        97,
        97,
        215,
        144,
        93,
        146,
        22,
        124
      ]
    },
    {
      "name": "InitBoostEvent",
      "discriminator": [
        174,
        124,
        74,
        249,
        4,
        81,
        246,
        17
      ]
    },
    {
      "name": "InitUserVolumeAccumulatorEvent",
      "discriminator": [
        134,
        36,
        13,
        72,
        232,
        101,
        130,
        216
      ]
    },
    {
      "name": "MigratePoolCoinCreatorEvent",
      "discriminator": [
        170,
        221,
        82,
        199,
        147,
        165,
        247,
        46
      ]
    },
    {
      "name": "ReservedFeeRecipientsEvent",
      "discriminator": [
        43,
        188,
        250,
        18,
        221,
        75,
        187,
        95
      ]
    },
    {
      "name": "SellEvent",
      "discriminator": [
        62,
        47,
        55,
        10,
        165,
        3,
        220,
        42
      ]
    },
    {
      "name": "SetBondingCurveCoinCreatorEvent",
      "discriminator": [
        242,
        231,
        235,
        102,
        65,
        99,
        189,
        211
      ]
    },
    {
      "name": "SetBoostAuthorityEvent",
      "discriminator": [
        89,
        128,
        240,
        141,
        91,
        202,
        71,
        105
      ]
    },
    {
      "name": "SetMetaplexCoinCreatorEvent",
      "discriminator": [
        150,
        107,
        199,
        123,
        124,
        207,
        102,
        228
      ]
    },
    {
      "name": "SweepPoolFeeEvent",
      "discriminator": [
        130,
        164,
        36,
        97,
        228,
        130,
        135,
        165
      ]
    },
    {
      "name": "SyncUserVolumeAccumulatorEvent",
      "discriminator": [
        197,
        122,
        167,
        124,
        116,
        81,
        91,
        255
      ]
    },
    {
      "name": "UpdateAdminEvent",
      "discriminator": [
        225,
        152,
        171,
        87,
        246,
        63,
        66,
        234
      ]
    },
    {
      "name": "UpdateCreatorFeeConfigEvent",
      "discriminator": [
        152,
        198,
        124,
        124,
        106,
        246,
        127,
        191
      ]
    },
    {
      "name": "UpdateFeeConfigEvent",
      "discriminator": [
        90,
        23,
        65,
        35,
        62,
        244,
        188,
        208
      ]
    },
    {
      "name": "WithdrawEvent",
      "discriminator": [
        22,
        9,
        133,
        26,
        160,
        44,
        71,
        192
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "FeeBasisPointsExceedsMaximum"
    },
    {
      "code": 6001,
      "name": "ZeroBaseAmount"
    },
    {
      "code": 6002,
      "name": "ZeroQuoteAmount"
    },
    {
      "code": 6003,
      "name": "TooLittlePoolTokenLiquidity"
    },
    {
      "code": 6004,
      "name": "ExceededSlippage"
    },
    {
      "code": 6005,
      "name": "InvalidAdmin"
    },
    {
      "code": 6006,
      "name": "UnsupportedBaseMint"
    },
    {
      "code": 6007,
      "name": "UnsupportedQuoteMint"
    },
    {
      "code": 6008,
      "name": "InvalidBaseMint"
    },
    {
      "code": 6009,
      "name": "InvalidQuoteMint"
    },
    {
      "code": 6010,
      "name": "InvalidLpMint"
    },
    {
      "code": 6011,
      "name": "AllProtocolFeeRecipientsShouldBeNonZero"
    },
    {
      "code": 6012,
      "name": "UnsortedNotUniqueProtocolFeeRecipients"
    },
    {
      "code": 6013,
      "name": "InvalidProtocolFeeRecipient"
    },
    {
      "code": 6014,
      "name": "InvalidPoolBaseTokenAccount"
    },
    {
      "code": 6015,
      "name": "InvalidPoolQuoteTokenAccount"
    },
    {
      "code": 6016,
      "name": "BuyMoreBaseAmountThanPoolReserves"
    },
    {
      "code": 6017,
      "name": "DisabledCreatePool"
    },
    {
      "code": 6018,
      "name": "DisabledDeposit"
    },
    {
      "code": 6019,
      "name": "DisabledWithdraw"
    },
    {
      "code": 6020,
      "name": "DisabledBuy"
    },
    {
      "code": 6021,
      "name": "DisabledSell"
    },
    {
      "code": 6022,
      "name": "SameMint"
    },
    {
      "code": 6023,
      "name": "Overflow"
    },
    {
      "code": 6024,
      "name": "Truncation"
    },
    {
      "code": 6025,
      "name": "DivisionByZero"
    },
    {
      "code": 6026,
      "name": "NewSizeLessThanCurrentSize"
    },
    {
      "code": 6027,
      "name": "AccountTypeNotSupported"
    },
    {
      "code": 6028,
      "name": "OnlyCanonicalPumpPoolsCanHaveCoinCreator"
    },
    {
      "code": 6029,
      "name": "InvalidAdminSetCoinCreatorAuthority"
    },
    {
      "code": 6030,
      "name": "StartTimeInThePast"
    },
    {
      "code": 6031,
      "name": "EndTimeInThePast"
    },
    {
      "code": 6032,
      "name": "EndTimeBeforeStartTime"
    },
    {
      "code": 6033,
      "name": "TimeRangeTooLarge"
    },
    {
      "code": 6034,
      "name": "EndTimeBeforeCurrentDay"
    },
    {
      "code": 6035,
      "name": "SupplyUpdateForFinishedRange"
    },
    {
      "code": 6036,
      "name": "DayIndexAfterEndIndex"
    },
    {
      "code": 6037,
      "name": "DayInActiveRange"
    },
    {
      "code": 6038,
      "name": "InvalidIncentiveMint"
    },
    {
      "code": 6039,
      "name": "BuyNotEnoughQuoteTokensToCoverFees",
      "msg": "buy: Not enough quote tokens to cover for fees."
    },
    {
      "code": 6040,
      "name": "BuySlippageBelowMinBaseAmountOut",
      "msg": "buy: slippage - would buy less tokens than expected min_base_amount_out"
    },
    {
      "code": 6041,
      "name": "MayhemModeDisabled"
    },
    {
      "code": 6042,
      "name": "OnlyPumpPoolsMayhemMode"
    },
    {
      "code": 6043,
      "name": "MayhemModeInDesiredState"
    },
    {
      "code": 6044,
      "name": "NotEnoughRemainingAccounts"
    },
    {
      "code": 6045,
      "name": "InvalidSharingConfigBaseMint"
    },
    {
      "code": 6046,
      "name": "InvalidSharingConfigCoinCreator"
    },
    {
      "code": 6047,
      "name": "CoinCreatorMigratedToSharingConfig",
      "msg": "coin creator has been migrated to sharing config"
    },
    {
      "code": 6048,
      "name": "CreatorVaultMigratedToSharingConfig",
      "msg": "creator_vault has been migrated to sharing config, use pump:distribute_creator_fees instead"
    },
    {
      "code": 6049,
      "name": "CashbackNotEnabled",
      "msg": "Cashback is disabled"
    },
    {
      "code": 6050,
      "name": "OnlyPumpPoolsCashback"
    },
    {
      "code": 6051,
      "name": "CashbackNotInDesiredState"
    },
    {
      "code": 6052,
      "name": "TokensInVaultLessThanCashbackEarned"
    },
    {
      "code": 6053,
      "name": "BuybackFeeRecipientNotAuthorized",
      "msg": "Buyback fee recipient not authorized"
    },
    {
      "code": 6054,
      "name": "AllBuybackFeeRecipientsShouldBeNonZero"
    },
    {
      "code": 6055,
      "name": "NotUniqueBuybackFeeRecipients"
    },
    {
      "code": 6056,
      "name": "BuybackBasisPointsOutOfRange",
      "msg": "buyback_basis_points must be <= 10_000"
    },
    {
      "code": 6057,
      "name": "WrongBuybackFeeRecipientsCount",
      "msg": "buyback fee recipients require exactly 8 remaining accounts (or none)"
    },
    {
      "code": 6058,
      "name": "BuybackFeeRecipientMissing"
    },
    {
      "code": 6059,
      "name": "MissingCashbackAccounts",
      "msg": "Cashback trade is missing the required remaining accounts"
    },
    {
      "code": 6060,
      "name": "InvalidCashbackAccumulator",
      "msg": "Cashback user_volume_accumulator account is invalid"
    },
    {
      "code": 6061,
      "name": "InvalidCashbackAccumulatorAta",
      "msg": "Cashback user_volume_accumulator ATA is missing or invalid"
    },
    {
      "code": 6062,
      "name": "InvalidPoolV2",
      "msg": "pool_v2 remaining account is missing or invalid"
    },
    {
      "code": 6063,
      "name": "InsufficientRealQuoteReserves",
      "msg": "BOOST: sell output exceeds the real quote vault. effective = real + virtual is pricing-only; payout is capped at real_vault, so quote min(out, real_vault)"
    },
    {
      "code": 6064,
      "name": "BoostPoolLiquidityUnsupported",
      "msg": "BOOST: deposit/withdraw don't apply to boost pools"
    },
    {
      "code": 6065,
      "name": "PoolCannotBoost",
      "msg": "BOOST: pool cannot be boosted (no virtual reserves)"
    },
    {
      "code": 6066,
      "name": "BoostDisabled",
      "msg": "BOOST: boost is disabled"
    },
    {
      "code": 6067,
      "name": "SeedLockViolation",
      "msg": "BOOST: lp_supply must never drop below the circulating LP mint supply"
    },
    {
      "code": 6068,
      "name": "CreatorFeeNotConfigurable",
      "msg": "Configurable creator fee is disabled"
    },
    {
      "code": 6069,
      "name": "CreatorFeeBpsOutOfRange",
      "msg": "Creator fee basis points must be between 1 and the configured maximum"
    },
    {
      "code": 6070,
      "name": "CreatorFeeNotEditable",
      "msg": "Creator fee is not editable for this pool"
    },
    {
      "code": 6071,
      "name": "CreatorFeeNotAllowedForCashbackCoin",
      "msg": "Cashback coins cannot have a creator fee"
    },
    {
      "code": 6072,
      "name": "SharingConfigNotActive",
      "msg": "Sharing config is not active"
    },
    {
      "code": 6073,
      "name": "NotAuthorized",
      "msg": "Not authorized"
    },
    {
      "code": 6074,
      "name": "HolderRewardCreatorImmutable",
      "msg": "The coin creator of a holder-reward pool cannot be changed"
    },
    {
      "code": 6075,
      "name": "CtoNotAllowedForMayhemPool",
      "msg": "CTO is not allowed on a mayhem-mode pool"
    },
    {
      "code": 6076,
      "name": "InvalidHolderRewardCoinCreator",
      "msg": "A holder-reward pool's coin creator must be the holder-rewards PDA"
    },
    {
      "code": 6077,
      "name": "CreatorFeeNotConfigurableForQuote",
      "msg": "Creator fee is not configurable on a SOL or USDC quote; the fee schedule applies"
    },
    {
      "code": 6078,
      "name": "OnlyPumpPools",
      "msg": "Only canonical pump pools are supported by this instruction"
    },
    {
      "code": 6079,
      "name": "CashbackCoinNotSupported",
      "msg": "v2 trades do not support cashback coins; use the v1 instructions"
    },
    {
      "code": 6080,
      "name": "MayhemPoolNotSupported",
      "msg": "v2 trades do not support mayhem-mode pools; use the v1 instructions"
    },
    {
      "code": 6081,
      "name": "CreatorFeesNotSwept",
      "msg": "creator_fees must be swept before the coin creator changes"
    },
    {
      "code": 6082,
      "name": "FeeTiersEmpty",
      "msg": "The fee config tier table is empty"
    },
    {
      "code": 6083,
      "name": "FeeConfigTooShort",
      "msg": "The fee config account is shorter than its initialize size"
    },
    {
      "code": 6084,
      "name": "MultiHopDiscontinuousPath",
      "msg": "multi-hop: a hop's input mint is neither side of its pool or curve, or the route does not end in user_out_token_account's mint"
    },
    {
      "code": 6085,
      "name": "MultiHopCurveRunMismatch",
      "msg": "multi-hop: the balances around the bonding-curve hops do not match the amounts pump reported"
    },
    {
      "code": 6086,
      "name": "MultiHopMixedDirection",
      "msg": "multi-hop: every hop must trade in the same direction, all buys or all sells"
    },
    {
      "code": 6087,
      "name": "SelfTransferNotAllowed",
      "msg": "A transfer's source is its destination and the signer does not own it"
    },
    {
      "code": 6088,
      "name": "QuoteMintNotWritable",
      "msg": "quote_mint must be writable for a quote with a Token-2022 transfer fee: its withheld fees are harvested to the mint"
    }
  ],
  "types": [
    {
      "name": "AdminCtoPoolEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "timestamp",
            "type": "i64"
          },
          {
            "name": "base_mint",
            "type": "pubkey"
          },
          {
            "name": "pool",
            "type": "pubkey"
          },
          {
            "name": "old_coin_creator",
            "type": "pubkey"
          },
          {
            "name": "new_coin_creator",
            "type": "pubkey"
          },
          {
            "name": "is_holder_reward",
            "type": "bool"
          },
          {
            "name": "is_cashback_coin",
            "type": "bool"
          },
          {
            "name": "old_creator_fee_bps",
            "type": "u64"
          },
          {
            "name": "new_creator_fee_bps",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "AdminUpdateTokenIncentivesEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "start_time",
            "type": "i64"
          },
          {
            "name": "end_time",
            "type": "i64"
          },
          {
            "name": "day_number",
            "type": "u64"
          },
          {
            "name": "token_supply_per_day",
            "type": "u64"
          },
          {
            "name": "mint",
            "type": "pubkey"
          },
          {
            "name": "seconds_in_a_day",
            "type": "i64"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "BondingCurve",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "virtual_token_reserves",
            "type": "u64"
          },
          {
            "name": "virtual_sol_reserves",
            "type": "u64"
          },
          {
            "name": "real_token_reserves",
            "type": "u64"
          },
          {
            "name": "real_sol_reserves",
            "type": "u64"
          },
          {
            "name": "token_total_supply",
            "type": "u64"
          },
          {
            "name": "complete",
            "type": "bool"
          },
          {
            "name": "creator",
            "type": "pubkey"
          },
          {
            "name": "is_mayhem_mode",
            "type": "bool"
          },
          {
            "name": "is_cashback_coin",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "BoostBuyAndBurnEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "timestamp",
            "type": "i64"
          },
          {
            "name": "mint",
            "type": "pubkey"
          },
          {
            "name": "bonding_curve",
            "type": "pubkey"
          },
          {
            "name": "pool",
            "type": "pubkey"
          },
          {
            "name": "authority",
            "type": "pubkey"
          },
          {
            "name": "quote_amount_in_requested",
            "type": "u64"
          },
          {
            "name": "quote_amount_in_used",
            "type": "u64"
          },
          {
            "name": "base_amount_burned",
            "type": "u64"
          },
          {
            "name": "virtual_quote_reserves",
            "type": "i128"
          },
          {
            "name": "real_quote_reserves_after",
            "type": "u64"
          },
          {
            "name": "base_reserves_after",
            "type": "u64"
          },
          {
            "name": "boost_vault_remaining",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "BuyEvent",
      "docs": [
        "ix_name: \"buy\" | \"buy_exact_quote_in\""
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "timestamp",
            "type": "i64"
          },
          {
            "name": "base_amount_out",
            "type": "u64"
          },
          {
            "name": "max_quote_amount_in",
            "type": "u64"
          },
          {
            "name": "user_base_token_reserves",
            "type": "u64"
          },
          {
            "name": "user_quote_token_reserves",
            "type": "u64"
          },
          {
            "name": "pool_base_token_reserves",
            "type": "u64"
          },
          {
            "name": "pool_quote_token_reserves",
            "type": "u64"
          },
          {
            "name": "quote_amount_in",
            "type": "u64"
          },
          {
            "name": "lp_fee_basis_points",
            "type": "u64"
          },
          {
            "name": "lp_fee",
            "type": "u64"
          },
          {
            "name": "protocol_fee_basis_points",
            "type": "u64"
          },
          {
            "name": "protocol_fee",
            "type": "u64"
          },
          {
            "name": "quote_amount_in_with_lp_fee",
            "type": "u64"
          },
          {
            "name": "user_quote_amount_in",
            "type": "u64"
          },
          {
            "name": "pool",
            "type": "pubkey"
          },
          {
            "name": "user",
            "type": "pubkey"
          },
          {
            "name": "user_base_token_account",
            "type": "pubkey"
          },
          {
            "name": "user_quote_token_account",
            "type": "pubkey"
          },
          {
            "name": "protocol_fee_recipient",
            "type": "pubkey"
          },
          {
            "name": "protocol_fee_recipient_token_account",
            "type": "pubkey"
          },
          {
            "name": "coin_creator",
            "type": "pubkey"
          },
          {
            "name": "coin_creator_fee_basis_points",
            "type": "u64"
          },
          {
            "name": "coin_creator_fee",
            "type": "u64"
          },
          {
            "name": "track_volume",
            "type": "bool"
          },
          {
            "name": "total_unclaimed_tokens",
            "type": "u64"
          },
          {
            "name": "total_claimed_tokens",
            "type": "u64"
          },
          {
            "name": "current_sol_volume",
            "type": "u64"
          },
          {
            "name": "last_update_timestamp",
            "type": "i64"
          },
          {
            "name": "min_base_amount_out",
            "type": "u64"
          },
          {
            "name": "ix_name",
            "type": "string"
          },
          {
            "name": "cashback_fee_basis_points",
            "type": "u64"
          },
          {
            "name": "cashback",
            "type": "u64"
          },
          {
            "name": "buyback_fee_basis_points",
            "type": "u64"
          },
          {
            "name": "buyback_fee",
            "type": "u64"
          },
          {
            "name": "virtual_quote_reserves",
            "type": "i128"
          },
          {
            "name": "can_boost",
            "type": "bool"
          },
          {
            "name": "base_supply",
            "type": "u64"
          },
          {
            "name": "holder_rewards_bps",
            "type": "u64"
          },
          {
            "name": "holder_rewards",
            "type": "u64"
          },
          {
            "name": "creator_fee_unclaimed",
            "type": "u64"
          },
          {
            "name": "quote_transfer_fee",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "ClaimCashbackEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "user",
            "type": "pubkey"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "timestamp",
            "type": "i64"
          },
          {
            "name": "total_claimed",
            "type": "u64"
          },
          {
            "name": "total_cashback_earned",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "ClaimTokenIncentivesEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "user",
            "type": "pubkey"
          },
          {
            "name": "mint",
            "type": "pubkey"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "timestamp",
            "type": "i64"
          },
          {
            "name": "total_claimed_tokens",
            "type": "u64"
          },
          {
            "name": "current_sol_volume",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "CloseUserVolumeAccumulatorEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "user",
            "type": "pubkey"
          },
          {
            "name": "timestamp",
            "type": "i64"
          },
          {
            "name": "total_unclaimed_tokens",
            "type": "u64"
          },
          {
            "name": "total_claimed_tokens",
            "type": "u64"
          },
          {
            "name": "current_sol_volume",
            "type": "u64"
          },
          {
            "name": "last_update_timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "CollectCoinCreatorFeeEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "timestamp",
            "type": "i64"
          },
          {
            "name": "coin_creator",
            "type": "pubkey"
          },
          {
            "name": "coin_creator_fee",
            "type": "u64"
          },
          {
            "name": "coin_creator_vault_ata",
            "type": "pubkey"
          },
          {
            "name": "coin_creator_token_account",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "ConfigStatus",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Paused"
          },
          {
            "name": "Active"
          }
        ]
      }
    },
    {
      "name": "CreateConfigEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "timestamp",
            "type": "i64"
          },
          {
            "name": "admin",
            "type": "pubkey"
          },
          {
            "name": "lp_fee_basis_points",
            "type": "u64"
          },
          {
            "name": "protocol_fee_basis_points",
            "type": "u64"
          },
          {
            "name": "protocol_fee_recipients",
            "type": {
              "array": [
                "pubkey",
                8
              ]
            }
          },
          {
            "name": "coin_creator_fee_basis_points",
            "type": "u64"
          },
          {
            "name": "admin_set_coin_creator_authority",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "CreatePoolEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "timestamp",
            "type": "i64"
          },
          {
            "name": "index",
            "type": "u16"
          },
          {
            "name": "creator",
            "type": "pubkey"
          },
          {
            "name": "base_mint",
            "type": "pubkey"
          },
          {
            "name": "quote_mint",
            "type": "pubkey"
          },
          {
            "name": "base_mint_decimals",
            "type": "u8"
          },
          {
            "name": "quote_mint_decimals",
            "type": "u8"
          },
          {
            "name": "base_amount_in",
            "type": "u64"
          },
          {
            "name": "quote_amount_in",
            "type": "u64"
          },
          {
            "name": "pool_base_amount",
            "type": "u64"
          },
          {
            "name": "pool_quote_amount",
            "type": "u64"
          },
          {
            "name": "minimum_liquidity",
            "type": "u64"
          },
          {
            "name": "initial_liquidity",
            "type": "u64"
          },
          {
            "name": "lp_token_amount_out",
            "type": "u64"
          },
          {
            "name": "pool_bump",
            "type": "u8"
          },
          {
            "name": "pool",
            "type": "pubkey"
          },
          {
            "name": "lp_mint",
            "type": "pubkey"
          },
          {
            "name": "user_base_token_account",
            "type": "pubkey"
          },
          {
            "name": "user_quote_token_account",
            "type": "pubkey"
          },
          {
            "name": "coin_creator",
            "type": "pubkey"
          },
          {
            "name": "is_mayhem_mode",
            "type": "bool"
          },
          {
            "name": "creator_fee_bps",
            "type": "u64"
          },
          {
            "name": "can_edit_creator_fee",
            "type": "bool"
          },
          {
            "name": "is_holder_reward",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "DepositEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "timestamp",
            "type": "i64"
          },
          {
            "name": "lp_token_amount_out",
            "type": "u64"
          },
          {
            "name": "max_base_amount_in",
            "type": "u64"
          },
          {
            "name": "max_quote_amount_in",
            "type": "u64"
          },
          {
            "name": "user_base_token_reserves",
            "type": "u64"
          },
          {
            "name": "user_quote_token_reserves",
            "type": "u64"
          },
          {
            "name": "pool_base_token_reserves",
            "type": "u64"
          },
          {
            "name": "pool_quote_token_reserves",
            "type": "u64"
          },
          {
            "name": "base_amount_in",
            "type": "u64"
          },
          {
            "name": "quote_amount_in",
            "type": "u64"
          },
          {
            "name": "lp_mint_supply",
            "type": "u64"
          },
          {
            "name": "pool",
            "type": "pubkey"
          },
          {
            "name": "user",
            "type": "pubkey"
          },
          {
            "name": "user_base_token_account",
            "type": "pubkey"
          },
          {
            "name": "user_quote_token_account",
            "type": "pubkey"
          },
          {
            "name": "user_pool_token_account",
            "type": "pubkey"
          },
          {
            "name": "quote_transfer_fee",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "DisableEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "timestamp",
            "type": "i64"
          },
          {
            "name": "admin",
            "type": "pubkey"
          },
          {
            "name": "disable_create_pool",
            "type": "bool"
          },
          {
            "name": "disable_deposit",
            "type": "bool"
          },
          {
            "name": "disable_withdraw",
            "type": "bool"
          },
          {
            "name": "disable_buy",
            "type": "bool"
          },
          {
            "name": "disable_sell",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "ExtendAccountEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "timestamp",
            "type": "i64"
          },
          {
            "name": "account",
            "type": "pubkey"
          },
          {
            "name": "user",
            "type": "pubkey"
          },
          {
            "name": "current_size",
            "type": "u64"
          },
          {
            "name": "new_size",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "FeeConfig",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "admin",
            "type": "pubkey"
          },
          {
            "name": "flat_fees",
            "type": {
              "defined": {
                "name": "Fees"
              }
            }
          },
          {
            "name": "fee_tiers",
            "type": {
              "vec": {
                "defined": {
                  "name": "FeeTier"
                }
              }
            }
          },
          {
            "name": "stable_fee_tiers",
            "type": {
              "vec": {
                "defined": {
                  "name": "FeeTier"
                }
              }
            }
          },
          {
            "name": "exotic_flat_fees",
            "type": {
              "defined": {
                "name": "Fees"
              }
            }
          }
        ]
      }
    },
    {
      "name": "FeeTier",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "market_cap_lamports_threshold",
            "type": "u128"
          },
          {
            "name": "fees",
            "type": {
              "defined": {
                "name": "Fees"
              }
            }
          }
        ]
      }
    },
    {
      "name": "Fees",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "lp_fee_bps",
            "type": "u64"
          },
          {
            "name": "protocol_fee_bps",
            "type": "u64"
          },
          {
            "name": "creator_fee_bps",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "GlobalConfig",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "admin",
            "docs": [
              "The admin pubkey"
            ],
            "type": "pubkey"
          },
          {
            "name": "lp_fee_basis_points",
            "type": "u64"
          },
          {
            "name": "protocol_fee_basis_points",
            "type": "u64"
          },
          {
            "name": "disable_flags",
            "docs": [
              "Flags to disable certain functionality",
              "bit 0 - Disable create pool",
              "bit 1 - Disable deposit",
              "bit 2 - Disable withdraw",
              "bit 3 - Disable buy",
              "bit 4 - Disable sell"
            ],
            "type": "u8"
          },
          {
            "name": "protocol_fee_recipients",
            "docs": [
              "Addresses of the protocol fee recipients"
            ],
            "type": {
              "array": [
                "pubkey",
                8
              ]
            }
          },
          {
            "name": "coin_creator_fee_basis_points",
            "type": "u64"
          },
          {
            "name": "admin_set_coin_creator_authority",
            "docs": [
              "The admin authority for setting coin creators"
            ],
            "type": "pubkey"
          },
          {
            "name": "whitelist_pda",
            "type": "pubkey"
          },
          {
            "name": "reserved_fee_recipient",
            "type": "pubkey"
          },
          {
            "name": "mayhem_mode_enabled",
            "type": "bool"
          },
          {
            "name": "reserved_fee_recipients",
            "type": {
              "array": [
                "pubkey",
                7
              ]
            }
          },
          {
            "name": "is_cashback_enabled",
            "type": "bool"
          },
          {
            "name": "buyback_fee_recipients",
            "type": {
              "array": [
                "pubkey",
                8
              ]
            }
          },
          {
            "name": "buyback_basis_points",
            "type": "u64"
          },
          {
            "name": "boost_authority",
            "type": "pubkey"
          },
          {
            "name": "boost_enabled",
            "type": "bool"
          },
          {
            "name": "creator_fee_configurable",
            "type": "bool"
          },
          {
            "name": "max_configurable_creator_fee_bps",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "GlobalVolumeAccumulator",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "start_time",
            "type": "i64"
          },
          {
            "name": "end_time",
            "type": "i64"
          },
          {
            "name": "seconds_in_a_day",
            "type": "i64"
          },
          {
            "name": "mint",
            "type": "pubkey"
          },
          {
            "name": "total_token_supply",
            "type": {
              "array": [
                "u64",
                30
              ]
            }
          },
          {
            "name": "sol_volumes",
            "type": {
              "array": [
                "u64",
                30
              ]
            }
          }
        ]
      }
    },
    {
      "name": "InitBoostEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "timestamp",
            "type": "i64"
          },
          {
            "name": "mint",
            "type": "pubkey"
          },
          {
            "name": "bonding_curve",
            "type": "pubkey"
          },
          {
            "name": "pool",
            "type": "pubkey"
          },
          {
            "name": "virtual_quote_reserves",
            "type": "i128"
          },
          {
            "name": "real_quote_reserves_after",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "InitUserVolumeAccumulatorEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "payer",
            "type": "pubkey"
          },
          {
            "name": "user",
            "type": "pubkey"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "MigratePoolCoinCreatorEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "timestamp",
            "type": "i64"
          },
          {
            "name": "base_mint",
            "type": "pubkey"
          },
          {
            "name": "pool",
            "type": "pubkey"
          },
          {
            "name": "sharing_config",
            "type": "pubkey"
          },
          {
            "name": "old_coin_creator",
            "type": "pubkey"
          },
          {
            "name": "new_coin_creator",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "OptionBool",
      "type": {
        "kind": "struct",
        "fields": [
          "bool"
        ]
      }
    },
    {
      "name": "OptionU64",
      "type": {
        "kind": "struct",
        "fields": [
          "u64"
        ]
      }
    },
    {
      "name": "Pool",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "pool_bump",
            "type": "u8"
          },
          {
            "name": "index",
            "type": "u16"
          },
          {
            "name": "creator",
            "type": "pubkey"
          },
          {
            "name": "base_mint",
            "type": "pubkey"
          },
          {
            "name": "quote_mint",
            "type": "pubkey"
          },
          {
            "name": "lp_mint",
            "type": "pubkey"
          },
          {
            "name": "pool_base_token_account",
            "type": "pubkey"
          },
          {
            "name": "pool_quote_token_account",
            "type": "pubkey"
          },
          {
            "name": "lp_supply",
            "docs": [
              "True circulating supply without burns and lock-ups"
            ],
            "type": "u64"
          },
          {
            "name": "coin_creator",
            "type": "pubkey"
          },
          {
            "name": "is_mayhem_mode",
            "type": "bool"
          },
          {
            "name": "is_cashback_coin",
            "type": "bool"
          },
          {
            "name": "virtual_quote_reserves",
            "docs": [
              "For non-boost pools, value is 0, so the behavior is identical to legacy pools."
            ],
            "type": "i128"
          },
          {
            "name": "creator_fee_bps",
            "type": "u64"
          },
          {
            "name": "can_edit_creator_fee",
            "type": "bool"
          },
          {
            "name": "is_holder_reward",
            "type": "bool"
          },
          {
            "name": "protocol_fees",
            "type": "u64"
          },
          {
            "name": "creator_fees",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "ReservedFeeRecipientsEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "timestamp",
            "type": "i64"
          },
          {
            "name": "reserved_fee_recipient",
            "type": "pubkey"
          },
          {
            "name": "reserved_fee_recipients",
            "type": {
              "array": [
                "pubkey",
                7
              ]
            }
          }
        ]
      }
    },
    {
      "name": "SellEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "timestamp",
            "type": "i64"
          },
          {
            "name": "base_amount_in",
            "type": "u64"
          },
          {
            "name": "min_quote_amount_out",
            "type": "u64"
          },
          {
            "name": "user_base_token_reserves",
            "type": "u64"
          },
          {
            "name": "user_quote_token_reserves",
            "type": "u64"
          },
          {
            "name": "pool_base_token_reserves",
            "type": "u64"
          },
          {
            "name": "pool_quote_token_reserves",
            "type": "u64"
          },
          {
            "name": "quote_amount_out",
            "type": "u64"
          },
          {
            "name": "lp_fee_basis_points",
            "type": "u64"
          },
          {
            "name": "lp_fee",
            "type": "u64"
          },
          {
            "name": "protocol_fee_basis_points",
            "type": "u64"
          },
          {
            "name": "protocol_fee",
            "type": "u64"
          },
          {
            "name": "quote_amount_out_without_lp_fee",
            "type": "u64"
          },
          {
            "name": "user_quote_amount_out",
            "type": "u64"
          },
          {
            "name": "pool",
            "type": "pubkey"
          },
          {
            "name": "user",
            "type": "pubkey"
          },
          {
            "name": "user_base_token_account",
            "type": "pubkey"
          },
          {
            "name": "user_quote_token_account",
            "type": "pubkey"
          },
          {
            "name": "protocol_fee_recipient",
            "type": "pubkey"
          },
          {
            "name": "protocol_fee_recipient_token_account",
            "type": "pubkey"
          },
          {
            "name": "coin_creator",
            "type": "pubkey"
          },
          {
            "name": "coin_creator_fee_basis_points",
            "type": "u64"
          },
          {
            "name": "coin_creator_fee",
            "type": "u64"
          },
          {
            "name": "cashback_fee_basis_points",
            "type": "u64"
          },
          {
            "name": "cashback",
            "type": "u64"
          },
          {
            "name": "buyback_fee_basis_points",
            "type": "u64"
          },
          {
            "name": "buyback_fee",
            "type": "u64"
          },
          {
            "name": "virtual_quote_reserves",
            "type": "i128"
          },
          {
            "name": "can_boost",
            "type": "bool"
          },
          {
            "name": "base_supply",
            "type": "u64"
          },
          {
            "name": "holder_rewards_bps",
            "type": "u64"
          },
          {
            "name": "holder_rewards",
            "type": "u64"
          },
          {
            "name": "creator_fee_unclaimed",
            "type": "u64"
          },
          {
            "name": "quote_transfer_fee",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "SetBondingCurveCoinCreatorEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "timestamp",
            "type": "i64"
          },
          {
            "name": "base_mint",
            "type": "pubkey"
          },
          {
            "name": "pool",
            "type": "pubkey"
          },
          {
            "name": "bonding_curve",
            "type": "pubkey"
          },
          {
            "name": "coin_creator",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "SetBoostAuthorityEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "timestamp",
            "type": "i64"
          },
          {
            "name": "admin",
            "type": "pubkey"
          },
          {
            "name": "old_boost_authority",
            "type": "pubkey"
          },
          {
            "name": "new_boost_authority",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "SetMetaplexCoinCreatorEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "timestamp",
            "type": "i64"
          },
          {
            "name": "base_mint",
            "type": "pubkey"
          },
          {
            "name": "pool",
            "type": "pubkey"
          },
          {
            "name": "metadata",
            "type": "pubkey"
          },
          {
            "name": "coin_creator",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "Shareholder",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "address",
            "type": "pubkey"
          },
          {
            "name": "share_bps",
            "type": "u16"
          }
        ]
      }
    },
    {
      "name": "SharingConfig",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "version",
            "type": "u8"
          },
          {
            "name": "status",
            "type": {
              "defined": {
                "name": "ConfigStatus"
              }
            }
          },
          {
            "name": "mint",
            "type": "pubkey"
          },
          {
            "name": "admin",
            "type": "pubkey"
          },
          {
            "name": "admin_revoked",
            "type": "bool"
          },
          {
            "name": "shareholders",
            "type": {
              "vec": {
                "defined": {
                  "name": "Shareholder"
                }
              }
            }
          }
        ]
      }
    },
    {
      "name": "SweepPoolFeeEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "timestamp",
            "type": "i64"
          },
          {
            "name": "pool",
            "type": "pubkey"
          },
          {
            "name": "base_mint",
            "type": "pubkey"
          },
          {
            "name": "quote_mint",
            "type": "pubkey"
          },
          {
            "name": "recipient",
            "type": "pubkey"
          },
          {
            "name": "payer",
            "type": "pubkey"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "bucket",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "SyncUserVolumeAccumulatorEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "user",
            "type": "pubkey"
          },
          {
            "name": "total_claimed_tokens_before",
            "type": "u64"
          },
          {
            "name": "total_claimed_tokens_after",
            "type": "u64"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "UpdateAdminEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "timestamp",
            "type": "i64"
          },
          {
            "name": "admin",
            "type": "pubkey"
          },
          {
            "name": "new_admin",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "UpdateCreatorFeeConfigEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "timestamp",
            "type": "i64"
          },
          {
            "name": "admin",
            "type": "pubkey"
          },
          {
            "name": "creator_fee_configurable",
            "type": "bool"
          },
          {
            "name": "max_configurable_creator_fee_bps",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "UpdateFeeConfigEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "timestamp",
            "type": "i64"
          },
          {
            "name": "admin",
            "type": "pubkey"
          },
          {
            "name": "lp_fee_basis_points",
            "type": "u64"
          },
          {
            "name": "protocol_fee_basis_points",
            "type": "u64"
          },
          {
            "name": "protocol_fee_recipients",
            "type": {
              "array": [
                "pubkey",
                8
              ]
            }
          },
          {
            "name": "coin_creator_fee_basis_points",
            "type": "u64"
          },
          {
            "name": "admin_set_coin_creator_authority",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "UserVolumeAccumulator",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "user",
            "type": "pubkey"
          },
          {
            "name": "needs_claim",
            "type": "bool"
          },
          {
            "name": "total_unclaimed_tokens",
            "type": "u64"
          },
          {
            "name": "total_claimed_tokens",
            "type": "u64"
          },
          {
            "name": "current_sol_volume",
            "type": "u64"
          },
          {
            "name": "last_update_timestamp",
            "type": "i64"
          },
          {
            "name": "has_total_claimed_tokens",
            "type": "bool"
          },
          {
            "name": "cashback_earned",
            "type": "u64"
          },
          {
            "name": "total_cashback_claimed",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "WithdrawEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "timestamp",
            "type": "i64"
          },
          {
            "name": "lp_token_amount_in",
            "type": "u64"
          },
          {
            "name": "min_base_amount_out",
            "type": "u64"
          },
          {
            "name": "min_quote_amount_out",
            "type": "u64"
          },
          {
            "name": "user_base_token_reserves",
            "type": "u64"
          },
          {
            "name": "user_quote_token_reserves",
            "type": "u64"
          },
          {
            "name": "pool_base_token_reserves",
            "type": "u64"
          },
          {
            "name": "pool_quote_token_reserves",
            "type": "u64"
          },
          {
            "name": "base_amount_out",
            "type": "u64"
          },
          {
            "name": "quote_amount_out",
            "type": "u64"
          },
          {
            "name": "lp_mint_supply",
            "type": "u64"
          },
          {
            "name": "pool",
            "type": "pubkey"
          },
          {
            "name": "user",
            "type": "pubkey"
          },
          {
            "name": "user_base_token_account",
            "type": "pubkey"
          },
          {
            "name": "user_quote_token_account",
            "type": "pubkey"
          },
          {
            "name": "user_pool_token_account",
            "type": "pubkey"
          },
          {
            "name": "quote_transfer_fee",
            "type": "u64"
          }
        ]
      }
    }
  ]
};

export const pumpFeesIdl: any = {
  "address": "pfeeUxB6jkeY1Hxd7CsFCAjcbHA9rWtchMGdZ6VojVZ",
  "metadata": {
    "name": "pump_fees",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "admin_cto_sharing_config",
      "discriminator": [
        60,
        100,
        144,
        156,
        64,
        138,
        182,
        37
      ],
      "accounts": [
        {
          "name": "pool_authority",
          "signer": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  111,
                  111,
                  108,
                  45,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                1,
                86,
                224,
                246,
                147,
                102,
                90,
                207,
                68,
                219,
                21,
                104,
                191,
                23,
                91,
                170,
                81,
                137,
                203,
                151,
                245,
                210,
                255,
                59,
                101,
                93,
                43,
                182,
                253,
                109,
                24,
                176
              ]
            }
          }
        },
        {
          "name": "authority",
          "signer": true
        },
        {
          "name": "global",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  108,
                  111,
                  98,
                  97,
                  108
                ]
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                1,
                86,
                224,
                246,
                147,
                102,
                90,
                207,
                68,
                219,
                21,
                104,
                191,
                23,
                91,
                170,
                81,
                137,
                203,
                151,
                245,
                210,
                255,
                59,
                101,
                93,
                43,
                182,
                253,
                109,
                24,
                176
              ]
            }
          }
        },
        {
          "name": "mint",
          "relations": [
            "sharing_config"
          ]
        },
        {
          "name": "sharing_config",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  104,
                  97,
                  114,
                  105,
                  110,
                  103,
                  45,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        },
        {
          "name": "event_authority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  95,
                  95,
                  101,
                  118,
                  101,
                  110,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "program",
          "address": "pfeeUxB6jkeY1Hxd7CsFCAjcbHA9rWtchMGdZ6VojVZ"
        }
      ],
      "args": [
        {
          "name": "new_admin",
          "type": {
            "option": "pubkey"
          }
        }
      ]
    },
    {
      "name": "claim_social_fee_pda",
      "discriminator": [
        225,
        21,
        251,
        133,
        161,
        30,
        199,
        226
      ],
      "accounts": [
        {
          "name": "recipient",
          "writable": true
        },
        {
          "name": "social_fee_pda",
          "writable": true
        },
        {
          "name": "fee_program_global",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  102,
                  101,
                  101,
                  45,
                  112,
                  114,
                  111,
                  103,
                  114,
                  97,
                  109,
                  45,
                  103,
                  108,
                  111,
                  98,
                  97,
                  108
                ]
              }
            ]
          }
        },
        {
          "name": "social_claim_authority",
          "signer": true,
          "relations": [
            "fee_program_global"
          ]
        },
        {
          "name": "event_authority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  95,
                  95,
                  101,
                  118,
                  101,
                  110,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "program"
        }
      ],
      "args": [
        {
          "name": "user_id",
          "type": "string"
        },
        {
          "name": "platform",
          "type": "u8"
        }
      ],
      "returns": {
        "option": {
          "defined": {
            "name": "SocialFeePdaClaimed"
          }
        }
      }
    },
    {
      "name": "claim_social_fee_pda_v2",
      "discriminator": [
        17,
        77,
        240,
        134,
        58,
        188,
        53,
        149
      ],
      "accounts": [
        {
          "name": "recipient",
          "writable": true
        },
        {
          "name": "social_fee_pda",
          "writable": true
        },
        {
          "name": "quote_mint",
          "docs": [
            "Quote mint for claim"
          ],
          "writable": true
        },
        {
          "name": "associated_social_fee_pda",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "social_fee_pda"
              },
              {
                "kind": "account",
                "path": "quote_token_program"
              },
              {
                "kind": "account",
                "path": "quote_mint"
              }
            ],
            "program": {
              "kind": "account",
              "path": "associated_token_program"
            }
          }
        },
        {
          "name": "associated_recipient",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "recipient"
              },
              {
                "kind": "account",
                "path": "quote_token_program"
              },
              {
                "kind": "account",
                "path": "quote_mint"
              }
            ],
            "program": {
              "kind": "account",
              "path": "associated_token_program"
            }
          }
        },
        {
          "name": "quote_token_program"
        },
        {
          "name": "associated_token_program",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "fee_program_global",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  102,
                  101,
                  101,
                  45,
                  112,
                  114,
                  111,
                  103,
                  114,
                  97,
                  109,
                  45,
                  103,
                  108,
                  111,
                  98,
                  97,
                  108
                ]
              }
            ]
          }
        },
        {
          "name": "social_claim_authority",
          "signer": true,
          "relations": [
            "fee_program_global"
          ]
        },
        {
          "name": "system_program",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "event_authority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  95,
                  95,
                  101,
                  118,
                  101,
                  110,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "program"
        }
      ],
      "args": [
        {
          "name": "user_id",
          "type": "string"
        },
        {
          "name": "platform",
          "type": "u8"
        }
      ],
      "returns": {
        "option": {
          "defined": {
            "name": "SocialFeePdaClaimed"
          }
        }
      }
    },
    {
      "name": "crank_donation_fee_pda",
      "discriminator": [
        220,
        10,
        189,
        167,
        169,
        17,
        25,
        69
      ],
      "accounts": [
        {
          "name": "event_authority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  95,
                  95,
                  101,
                  118,
                  101,
                  110,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "program",
          "address": "pfeeUxB6jkeY1Hxd7CsFCAjcbHA9rWtchMGdZ6VojVZ"
        },
        {
          "name": "payer",
          "docs": [
            "Pays rent when [`temp_wsol_token_account`] is created (`init_if_needed`); receives rent when it is closed after the relay CPI."
          ],
          "writable": true,
          "signer": true
        },
        {
          "name": "system_program",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "token_program",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "associated_token_program",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "rent",
          "address": "SysvarRent111111111111111111111111111111111"
        },
        {
          "name": "fee_program_global",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  102,
                  101,
                  101,
                  45,
                  112,
                  114,
                  111,
                  103,
                  114,
                  97,
                  109,
                  45,
                  103,
                  108,
                  111,
                  98,
                  97,
                  108
                ]
              }
            ]
          }
        },
        {
          "name": "donation_fee_pda",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  100,
                  111,
                  110,
                  97,
                  116,
                  105,
                  111,
                  110,
                  45,
                  102,
                  101,
                  101,
                  45,
                  112,
                  100,
                  97
                ]
              },
              {
                "kind": "account",
                "path": "donation_fee_pda.base_mint",
                "account": "DonationFeePda"
              },
              {
                "kind": "account",
                "path": "donation_fee_pda.config_id",
                "account": "DonationFeePda"
              }
            ]
          }
        },
        {
          "name": "quote_mint",
          "docs": [
            "Quote mint from donation fee pda."
          ],
          "writable": true
        },
        {
          "name": "donation_fee_pda_ata",
          "docs": [
            "WSOL ATA owned by `donation_fee_pda`."
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "donation_fee_pda"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "quote_mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "donation_relay_program",
          "address": "RLAYHr9TRFcKB2ubYQhspcnXiaGpaVzNQvHytt47RZu"
        },
        {
          "name": "donation_relay_event_authority"
        },
        {
          "name": "mint_whitelist"
        },
        {
          "name": "epoch_tracker",
          "writable": true
        },
        {
          "name": "debouncer",
          "writable": true
        },
        {
          "name": "debouncer_ata",
          "writable": true
        }
      ],
      "args": []
    },
    {
      "name": "create_donation_fee_pda",
      "discriminator": [
        244,
        139,
        16,
        88,
        14,
        255,
        122,
        26
      ],
      "accounts": [
        {
          "name": "event_authority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  95,
                  95,
                  101,
                  118,
                  101,
                  110,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "program",
          "address": "pfeeUxB6jkeY1Hxd7CsFCAjcbHA9rWtchMGdZ6VojVZ"
        },
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "system_program",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "fee_program_global",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  102,
                  101,
                  101,
                  45,
                  112,
                  114,
                  111,
                  103,
                  114,
                  97,
                  109,
                  45,
                  103,
                  108,
                  111,
                  98,
                  97,
                  108
                ]
              }
            ]
          }
        },
        {
          "name": "donation_fee_pda",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  100,
                  111,
                  110,
                  97,
                  116,
                  105,
                  111,
                  110,
                  45,
                  102,
                  101,
                  101,
                  45,
                  112,
                  100,
                  97
                ]
              },
              {
                "kind": "account",
                "path": "base_mint"
              },
              {
                "kind": "account",
                "path": "config_id"
              }
            ]
          }
        },
        {
          "name": "config_id",
          "docs": [
            "stored on the PDA, so distinct `config_id`s for the same `base_mint` derive distinct addresses."
          ]
        },
        {
          "name": "base_mint"
        },
        {
          "name": "bonding_curve",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  111,
                  110,
                  100,
                  105,
                  110,
                  103,
                  45,
                  99,
                  117,
                  114,
                  118,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "base_mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                1,
                86,
                224,
                246,
                147,
                102,
                90,
                207,
                68,
                219,
                21,
                104,
                191,
                23,
                91,
                170,
                81,
                137,
                203,
                151,
                245,
                210,
                255,
                59,
                101,
                93,
                43,
                182,
                253,
                109,
                24,
                176
              ]
            }
          }
        },
        {
          "name": "pool"
        },
        {
          "name": "sharing_config",
          "docs": [
            "(derived from `[SHARING_CONFIG_SEED, base_mint]`)"
          ],
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  104,
                  97,
                  114,
                  105,
                  110,
                  103,
                  45,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              },
              {
                "kind": "account",
                "path": "base_mint"
              }
            ]
          }
        }
      ],
      "args": []
    },
    {
      "name": "create_fee_sharing_config",
      "docs": [
        "Create Fee Sharing Config"
      ],
      "discriminator": [
        195,
        78,
        86,
        76,
        111,
        52,
        251,
        213
      ],
      "accounts": [
        {
          "name": "event_authority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  95,
                  95,
                  101,
                  118,
                  101,
                  110,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "program",
          "address": "pfeeUxB6jkeY1Hxd7CsFCAjcbHA9rWtchMGdZ6VojVZ"
        },
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "global",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  108,
                  111,
                  98,
                  97,
                  108
                ]
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                1,
                86,
                224,
                246,
                147,
                102,
                90,
                207,
                68,
                219,
                21,
                104,
                191,
                23,
                91,
                170,
                81,
                137,
                203,
                151,
                245,
                210,
                255,
                59,
                101,
                93,
                43,
                182,
                253,
                109,
                24,
                176
              ]
            }
          }
        },
        {
          "name": "mint"
        },
        {
          "name": "sharing_config",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  104,
                  97,
                  114,
                  105,
                  110,
                  103,
                  45,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        },
        {
          "name": "system_program",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "bonding_curve",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  111,
                  110,
                  100,
                  105,
                  110,
                  103,
                  45,
                  99,
                  117,
                  114,
                  118,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                1,
                86,
                224,
                246,
                147,
                102,
                90,
                207,
                68,
                219,
                21,
                104,
                191,
                23,
                91,
                170,
                81,
                137,
                203,
                151,
                245,
                210,
                255,
                59,
                101,
                93,
                43,
                182,
                253,
                109,
                24,
                176
              ]
            }
          }
        },
        {
          "name": "pump_program",
          "address": "6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P"
        },
        {
          "name": "pump_event_authority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  95,
                  95,
                  101,
                  118,
                  101,
                  110,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                1,
                86,
                224,
                246,
                147,
                102,
                90,
                207,
                68,
                219,
                21,
                104,
                191,
                23,
                91,
                170,
                81,
                137,
                203,
                151,
                245,
                210,
                255,
                59,
                101,
                93,
                43,
                182,
                253,
                109,
                24,
                176
              ]
            }
          }
        },
        {
          "name": "pool",
          "writable": true,
          "optional": true
        },
        {
          "name": "pump_amm_program",
          "optional": true,
          "address": "pAMMBay6oceH9fJKBRHGP5D4bD4sWpmSwMn52FMfXEA"
        },
        {
          "name": "pump_amm_event_authority",
          "optional": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  95,
                  95,
                  101,
                  118,
                  101,
                  110,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                12,
                20,
                222,
                252,
                130,
                94,
                198,
                118,
                148,
                37,
                8,
                24,
                187,
                101,
                64,
                101,
                244,
                41,
                141,
                49,
                86,
                213,
                113,
                180,
                212,
                248,
                9,
                12,
                24,
                233,
                168,
                99
              ]
            }
          }
        }
      ],
      "args": []
    },
    {
      "name": "create_social_fee_pda",
      "discriminator": [
        144,
        224,
        59,
        211,
        78,
        248,
        202,
        220
      ],
      "accounts": [
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "social_fee_pda",
          "writable": true
        },
        {
          "name": "system_program",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "fee_program_global",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  102,
                  101,
                  101,
                  45,
                  112,
                  114,
                  111,
                  103,
                  114,
                  97,
                  109,
                  45,
                  103,
                  108,
                  111,
                  98,
                  97,
                  108
                ]
              }
            ]
          }
        },
        {
          "name": "event_authority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  95,
                  95,
                  101,
                  118,
                  101,
                  110,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "program"
        }
      ],
      "args": [
        {
          "name": "user_id",
          "type": "string"
        },
        {
          "name": "platform",
          "type": "u8"
        }
      ]
    },
    {
      "name": "extend_fee_config",
      "docs": [
        "Realloc the fee_config PDA to [`FeeConfig::CURRENT_SIZE`] (signer pays rent delta)."
      ],
      "discriminator": [
        68,
        179,
        244,
        90,
        173,
        56,
        17,
        217
      ],
      "accounts": [
        {
          "name": "fee_config",
          "writable": true
        },
        {
          "name": "user",
          "signer": true
        },
        {
          "name": "config_program_id"
        },
        {
          "name": "system_program",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "event_authority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  95,
                  95,
                  101,
                  118,
                  101,
                  110,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "program"
        }
      ],
      "args": []
    },
    {
      "name": "get_fees",
      "docs": [
        "Get Fees"
      ],
      "discriminator": [
        231,
        37,
        126,
        85,
        207,
        91,
        63,
        52
      ],
      "accounts": [
        {
          "name": "fee_config",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  102,
                  101,
                  101,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              },
              {
                "kind": "account",
                "path": "config_program_id"
              }
            ]
          }
        },
        {
          "name": "config_program_id"
        }
      ],
      "args": [
        {
          "name": "is_pump_pool",
          "type": "bool"
        },
        {
          "name": "market_cap_lamports",
          "type": "u128"
        },
        {
          "name": "trade_size_lamports",
          "type": "u64"
        },
        {
          "name": "is_new_quote_mint",
          "type": {
            "defined": {
              "name": "OptionBool"
            }
          }
        }
      ],
      "returns": {
        "defined": {
          "name": "Fees"
        }
      }
    },
    {
      "name": "get_fees_with_quote_mint",
      "discriminator": [
        154,
        237,
        138,
        92,
        162,
        2,
        162,
        187
      ],
      "accounts": [
        {
          "name": "fee_config",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  102,
                  101,
                  101,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              },
              {
                "kind": "account",
                "path": "config_program_id"
              }
            ]
          }
        },
        {
          "name": "config_program_id"
        }
      ],
      "args": [
        {
          "name": "is_pump_pool",
          "type": "bool"
        },
        {
          "name": "market_cap_lamports",
          "type": "u128"
        },
        {
          "name": "quote_mint",
          "type": "pubkey"
        }
      ],
      "returns": {
        "defined": {
          "name": "Fees"
        }
      }
    },
    {
      "name": "initialize_buyback",
      "discriminator": [
        250,
        129,
        236,
        160,
        227,
        36,
        103,
        134
      ],
      "accounts": [
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "buyback_vault",
          "writable": true
        },
        {
          "name": "buyback_vault_ata",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "buyback_vault"
              },
              {
                "kind": "account",
                "path": "token_program"
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "system_program",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "associated_token_program",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "mint"
        },
        {
          "name": "token_program"
        },
        {
          "name": "event_authority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  95,
                  95,
                  101,
                  118,
                  101,
                  110,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "program"
        }
      ],
      "args": [
        {
          "name": "index",
          "type": "u8"
        }
      ]
    },
    {
      "name": "initialize_fee_config",
      "docs": [
        "Initialize FeeConfig admin"
      ],
      "discriminator": [
        62,
        162,
        20,
        133,
        121,
        65,
        145,
        27
      ],
      "accounts": [
        {
          "name": "admin",
          "writable": true,
          "signer": true,
          "address": "8LWu7QM2dGR1G8nKDHthckea57bkCzXyBTAKPJUBDHo8"
        },
        {
          "name": "fee_config",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  102,
                  101,
                  101,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              },
              {
                "kind": "account",
                "path": "config_program_id"
              }
            ]
          }
        },
        {
          "name": "system_program",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "config_program_id"
        },
        {
          "name": "event_authority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  95,
                  95,
                  101,
                  118,
                  101,
                  110,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "program"
        }
      ],
      "args": []
    },
    {
      "name": "initialize_fee_program_global",
      "discriminator": [
        35,
        215,
        130,
        84,
        233,
        56,
        124,
        167
      ],
      "accounts": [
        {
          "name": "authority",
          "writable": true,
          "signer": true,
          "relations": [
            "pump_global"
          ]
        },
        {
          "name": "pump_global",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  108,
                  111,
                  98,
                  97,
                  108
                ]
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                1,
                86,
                224,
                246,
                147,
                102,
                90,
                207,
                68,
                219,
                21,
                104,
                191,
                23,
                91,
                170,
                81,
                137,
                203,
                151,
                245,
                210,
                255,
                59,
                101,
                93,
                43,
                182,
                253,
                109,
                24,
                176
              ]
            }
          }
        },
        {
          "name": "fee_program_global",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  102,
                  101,
                  101,
                  45,
                  112,
                  114,
                  111,
                  103,
                  114,
                  97,
                  109,
                  45,
                  103,
                  108,
                  111,
                  98,
                  97,
                  108
                ]
              }
            ]
          }
        },
        {
          "name": "system_program",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "event_authority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  95,
                  95,
                  101,
                  118,
                  101,
                  110,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "program"
        }
      ],
      "args": [
        {
          "name": "social_claim_authority",
          "type": "pubkey"
        },
        {
          "name": "disable_flags",
          "type": "u8"
        },
        {
          "name": "claim_rate_limit",
          "type": "u64"
        }
      ]
    },
    {
      "name": "revoke_fee_sharing_authority",
      "docs": [
        "Revoke Fee Sharing Authority"
      ],
      "discriminator": [
        18,
        233,
        158,
        39,
        185,
        207,
        58,
        104
      ],
      "accounts": [],
      "args": []
    },
    {
      "name": "set_authority",
      "discriminator": [
        133,
        250,
        37,
        21,
        110,
        163,
        26,
        121
      ],
      "accounts": [
        {
          "name": "authority",
          "writable": true,
          "signer": true,
          "relations": [
            "fee_program_global"
          ]
        },
        {
          "name": "fee_program_global",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  102,
                  101,
                  101,
                  45,
                  112,
                  114,
                  111,
                  103,
                  114,
                  97,
                  109,
                  45,
                  103,
                  108,
                  111,
                  98,
                  97,
                  108
                ]
              }
            ]
          }
        },
        {
          "name": "event_authority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  95,
                  95,
                  101,
                  118,
                  101,
                  110,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "program"
        }
      ],
      "args": [
        {
          "name": "new_authority",
          "type": "pubkey"
        }
      ]
    },
    {
      "name": "set_claim_rate_limit",
      "discriminator": [
        185,
        211,
        159,
        174,
        212,
        49,
        88,
        4
      ],
      "accounts": [
        {
          "name": "authority",
          "writable": true,
          "signer": true,
          "relations": [
            "fee_program_global"
          ]
        },
        {
          "name": "fee_program_global",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  102,
                  101,
                  101,
                  45,
                  112,
                  114,
                  111,
                  103,
                  114,
                  97,
                  109,
                  45,
                  103,
                  108,
                  111,
                  98,
                  97,
                  108
                ]
              }
            ]
          }
        },
        {
          "name": "event_authority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  95,
                  95,
                  101,
                  118,
                  101,
                  110,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "program"
        }
      ],
      "args": [
        {
          "name": "claim_rate_limit",
          "type": "u64"
        }
      ]
    },
    {
      "name": "set_disable_flags",
      "discriminator": [
        194,
        217,
        112,
        35,
        114,
        222,
        51,
        190
      ],
      "accounts": [
        {
          "name": "authority",
          "writable": true,
          "signer": true,
          "relations": [
            "fee_program_global"
          ]
        },
        {
          "name": "fee_program_global",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  102,
                  101,
                  101,
                  45,
                  112,
                  114,
                  111,
                  103,
                  114,
                  97,
                  109,
                  45,
                  103,
                  108,
                  111,
                  98,
                  97,
                  108
                ]
              }
            ]
          }
        },
        {
          "name": "event_authority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  95,
                  95,
                  101,
                  118,
                  101,
                  110,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "program"
        }
      ],
      "args": [
        {
          "name": "disable_flags",
          "type": "u8"
        }
      ]
    },
    {
      "name": "set_exotic_flat_fees",
      "discriminator": [
        30,
        234,
        149,
        138,
        252,
        230,
        39,
        73
      ],
      "accounts": [
        {
          "name": "fee_config",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  102,
                  101,
                  101,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              },
              {
                "kind": "account",
                "path": "config_program_id"
              }
            ]
          }
        },
        {
          "name": "admin",
          "writable": true,
          "signer": true,
          "relations": [
            "fee_config"
          ]
        },
        {
          "name": "config_program_id"
        },
        {
          "name": "system_program",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "event_authority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  95,
                  95,
                  101,
                  118,
                  101,
                  110,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "program"
        }
      ],
      "args": [
        {
          "name": "exotic_flat_fees",
          "type": {
            "defined": {
              "name": "Fees"
            }
          }
        }
      ]
    },
    {
      "name": "set_social_claim_authority",
      "discriminator": [
        147,
        54,
        184,
        154,
        136,
        237,
        185,
        153
      ],
      "accounts": [
        {
          "name": "authority",
          "writable": true,
          "signer": true,
          "relations": [
            "fee_program_global"
          ]
        },
        {
          "name": "fee_program_global",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  102,
                  101,
                  101,
                  45,
                  112,
                  114,
                  111,
                  103,
                  114,
                  97,
                  109,
                  45,
                  103,
                  108,
                  111,
                  98,
                  97,
                  108
                ]
              }
            ]
          }
        },
        {
          "name": "event_authority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  95,
                  95,
                  101,
                  118,
                  101,
                  110,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "program"
        }
      ],
      "args": [
        {
          "name": "social_claim_authority",
          "type": "pubkey"
        }
      ]
    },
    {
      "name": "sweep_buyback",
      "discriminator": [
        138,
        33,
        204,
        38,
        207,
        161,
        159,
        226
      ],
      "accounts": [
        {
          "name": "destination",
          "writable": true
        },
        {
          "name": "authority",
          "writable": true,
          "signer": true,
          "relations": [
            "buyback_vault"
          ]
        },
        {
          "name": "buyback_vault",
          "writable": true
        },
        {
          "name": "buyback_vault_ata",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "buyback_vault"
              },
              {
                "kind": "account",
                "path": "token_program"
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "destination_ata",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "destination"
              },
              {
                "kind": "account",
                "path": "token_program"
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "system_program",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "associated_token_program",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "mint"
        },
        {
          "name": "token_program"
        },
        {
          "name": "event_authority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  95,
                  95,
                  101,
                  118,
                  101,
                  110,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "program"
        }
      ],
      "args": [
        {
          "name": "index",
          "type": "u8"
        }
      ]
    },
    {
      "name": "transfer_fee_sharing_authority",
      "docs": [
        "Transfer Fee Sharing Authority"
      ],
      "discriminator": [
        202,
        10,
        75,
        200,
        164,
        34,
        210,
        96
      ],
      "accounts": [],
      "args": []
    },
    {
      "name": "update_admin",
      "docs": [
        "Update admin (only callable by admin)"
      ],
      "discriminator": [
        161,
        176,
        40,
        213,
        60,
        184,
        179,
        228
      ],
      "accounts": [
        {
          "name": "admin",
          "signer": true,
          "relations": [
            "fee_config"
          ]
        },
        {
          "name": "fee_config",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  102,
                  101,
                  101,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              },
              {
                "kind": "account",
                "path": "config_program_id"
              }
            ]
          }
        },
        {
          "name": "new_admin"
        },
        {
          "name": "config_program_id"
        },
        {
          "name": "event_authority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  95,
                  95,
                  101,
                  118,
                  101,
                  110,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "program"
        }
      ],
      "args": []
    },
    {
      "name": "update_buyback_authority",
      "discriminator": [
        66,
        98,
        113,
        202,
        121,
        37,
        219,
        107
      ],
      "accounts": [
        {
          "name": "authority",
          "writable": true,
          "signer": true,
          "relations": [
            "fee_program_global"
          ]
        },
        {
          "name": "fee_program_global",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  102,
                  101,
                  101,
                  45,
                  112,
                  114,
                  111,
                  103,
                  114,
                  97,
                  109,
                  45,
                  103,
                  108,
                  111,
                  98,
                  97,
                  108
                ]
              }
            ]
          }
        },
        {
          "name": "buyback_vault",
          "writable": true
        },
        {
          "name": "event_authority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  95,
                  95,
                  101,
                  118,
                  101,
                  110,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "program"
        }
      ],
      "args": [
        {
          "name": "index",
          "type": "u8"
        },
        {
          "name": "new_authority",
          "type": "pubkey"
        }
      ]
    },
    {
      "name": "update_buyback_claim_rate_limit",
      "discriminator": [
        186,
        95,
        135,
        190,
        255,
        199,
        137,
        170
      ],
      "accounts": [
        {
          "name": "authority",
          "writable": true,
          "signer": true,
          "relations": [
            "fee_program_global"
          ]
        },
        {
          "name": "fee_program_global",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  102,
                  101,
                  101,
                  45,
                  112,
                  114,
                  111,
                  103,
                  114,
                  97,
                  109,
                  45,
                  103,
                  108,
                  111,
                  98,
                  97,
                  108
                ]
              }
            ]
          }
        },
        {
          "name": "buyback_vault",
          "writable": true
        },
        {
          "name": "event_authority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  95,
                  95,
                  101,
                  118,
                  101,
                  110,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "program"
        }
      ],
      "args": [
        {
          "name": "index",
          "type": "u8"
        },
        {
          "name": "claim_rate_limit",
          "type": "i64"
        }
      ]
    },
    {
      "name": "update_fee_config",
      "docs": [
        "Set/Replace fee parameters entirely (only callable by admin)"
      ],
      "discriminator": [
        104,
        184,
        103,
        242,
        88,
        151,
        107,
        20
      ],
      "accounts": [
        {
          "name": "fee_config",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  102,
                  101,
                  101,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              },
              {
                "kind": "account",
                "path": "config_program_id"
              }
            ]
          }
        },
        {
          "name": "admin",
          "signer": true,
          "relations": [
            "fee_config"
          ]
        },
        {
          "name": "config_program_id"
        },
        {
          "name": "event_authority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  95,
                  95,
                  101,
                  118,
                  101,
                  110,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "program"
        }
      ],
      "args": [
        {
          "name": "fee_tiers",
          "type": {
            "vec": {
              "defined": {
                "name": "FeeTier"
              }
            }
          }
        },
        {
          "name": "flat_fees",
          "type": {
            "defined": {
              "name": "Fees"
            }
          }
        }
      ]
    },
    {
      "name": "update_fee_shares",
      "docs": [
        "Update Fee Shares, make sure to distribute all the fees before calling this"
      ],
      "discriminator": [
        189,
        13,
        136,
        99,
        187,
        164,
        237,
        35
      ],
      "accounts": [
        {
          "name": "event_authority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  95,
                  95,
                  101,
                  118,
                  101,
                  110,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "program",
          "address": "pfeeUxB6jkeY1Hxd7CsFCAjcbHA9rWtchMGdZ6VojVZ"
        },
        {
          "name": "authority",
          "signer": true
        },
        {
          "name": "global",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  108,
                  111,
                  98,
                  97,
                  108
                ]
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                1,
                86,
                224,
                246,
                147,
                102,
                90,
                207,
                68,
                219,
                21,
                104,
                191,
                23,
                91,
                170,
                81,
                137,
                203,
                151,
                245,
                210,
                255,
                59,
                101,
                93,
                43,
                182,
                253,
                109,
                24,
                176
              ]
            }
          }
        },
        {
          "name": "mint",
          "relations": [
            "sharing_config"
          ]
        },
        {
          "name": "sharing_config",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  104,
                  97,
                  114,
                  105,
                  110,
                  103,
                  45,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        },
        {
          "name": "bonding_curve",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  111,
                  110,
                  100,
                  105,
                  110,
                  103,
                  45,
                  99,
                  117,
                  114,
                  118,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                1,
                86,
                224,
                246,
                147,
                102,
                90,
                207,
                68,
                219,
                21,
                104,
                191,
                23,
                91,
                170,
                81,
                137,
                203,
                151,
                245,
                210,
                255,
                59,
                101,
                93,
                43,
                182,
                253,
                109,
                24,
                176
              ]
            }
          }
        },
        {
          "name": "pump_creator_vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  114,
                  101,
                  97,
                  116,
                  111,
                  114,
                  45,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "sharing_config"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                1,
                86,
                224,
                246,
                147,
                102,
                90,
                207,
                68,
                219,
                21,
                104,
                191,
                23,
                91,
                170,
                81,
                137,
                203,
                151,
                245,
                210,
                255,
                59,
                101,
                93,
                43,
                182,
                253,
                109,
                24,
                176
              ]
            }
          }
        },
        {
          "name": "system_program",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "pump_program",
          "address": "6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P"
        },
        {
          "name": "pump_event_authority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  95,
                  95,
                  101,
                  118,
                  101,
                  110,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                1,
                86,
                224,
                246,
                147,
                102,
                90,
                207,
                68,
                219,
                21,
                104,
                191,
                23,
                91,
                170,
                81,
                137,
                203,
                151,
                245,
                210,
                255,
                59,
                101,
                93,
                43,
                182,
                253,
                109,
                24,
                176
              ]
            }
          }
        },
        {
          "name": "pump_amm_program",
          "address": "pAMMBay6oceH9fJKBRHGP5D4bD4sWpmSwMn52FMfXEA"
        },
        {
          "name": "amm_event_authority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  95,
                  95,
                  101,
                  118,
                  101,
                  110,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                12,
                20,
                222,
                252,
                130,
                94,
                198,
                118,
                148,
                37,
                8,
                24,
                187,
                101,
                64,
                101,
                244,
                41,
                141,
                49,
                86,
                213,
                113,
                180,
                212,
                248,
                9,
                12,
                24,
                233,
                168,
                99
              ]
            }
          }
        },
        {
          "name": "wsol_mint",
          "address": "So11111111111111111111111111111111111111112"
        },
        {
          "name": "token_program",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "associated_token_program",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "coin_creator_vault_authority",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  114,
                  101,
                  97,
                  116,
                  111,
                  114,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "sharing_config"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                12,
                20,
                222,
                252,
                130,
                94,
                198,
                118,
                148,
                37,
                8,
                24,
                187,
                101,
                64,
                101,
                244,
                41,
                141,
                49,
                86,
                213,
                113,
                180,
                212,
                248,
                9,
                12,
                24,
                233,
                168,
                99
              ]
            }
          }
        },
        {
          "name": "coin_creator_vault_ata",
          "writable": true
        }
      ],
      "args": [
        {
          "name": "shareholders",
          "type": {
            "vec": {
              "defined": {
                "name": "Shareholder"
              }
            }
          }
        }
      ]
    },
    {
      "name": "update_fee_shares_v2",
      "docs": [
        "Update Fee Shares, make sure to distribute all the fees before calling this"
      ],
      "discriminator": [
        111,
        251,
        49,
        6,
        78,
        78,
        106,
        18
      ],
      "accounts": [
        {
          "name": "event_authority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  95,
                  95,
                  101,
                  118,
                  101,
                  110,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "program",
          "address": "pfeeUxB6jkeY1Hxd7CsFCAjcbHA9rWtchMGdZ6VojVZ"
        },
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "global",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  108,
                  111,
                  98,
                  97,
                  108
                ]
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                1,
                86,
                224,
                246,
                147,
                102,
                90,
                207,
                68,
                219,
                21,
                104,
                191,
                23,
                91,
                170,
                81,
                137,
                203,
                151,
                245,
                210,
                255,
                59,
                101,
                93,
                43,
                182,
                253,
                109,
                24,
                176
              ]
            }
          }
        },
        {
          "name": "mint",
          "relations": [
            "sharing_config"
          ]
        },
        {
          "name": "sharing_config",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  104,
                  97,
                  114,
                  105,
                  110,
                  103,
                  45,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        },
        {
          "name": "bonding_curve",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  111,
                  110,
                  100,
                  105,
                  110,
                  103,
                  45,
                  99,
                  117,
                  114,
                  118,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                1,
                86,
                224,
                246,
                147,
                102,
                90,
                207,
                68,
                219,
                21,
                104,
                191,
                23,
                91,
                170,
                81,
                137,
                203,
                151,
                245,
                210,
                255,
                59,
                101,
                93,
                43,
                182,
                253,
                109,
                24,
                176
              ]
            }
          }
        },
        {
          "name": "pump_creator_vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  114,
                  101,
                  97,
                  116,
                  111,
                  114,
                  45,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "sharing_config"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                1,
                86,
                224,
                246,
                147,
                102,
                90,
                207,
                68,
                219,
                21,
                104,
                191,
                23,
                91,
                170,
                81,
                137,
                203,
                151,
                245,
                210,
                255,
                59,
                101,
                93,
                43,
                182,
                253,
                109,
                24,
                176
              ]
            }
          }
        },
        {
          "name": "pump_creator_vault_ata",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "pump_creator_vault"
              },
              {
                "kind": "account",
                "path": "token_program"
              },
              {
                "kind": "account",
                "path": "quote_mint"
              }
            ],
            "program": {
              "kind": "account",
              "path": "associated_token_program"
            }
          }
        },
        {
          "name": "system_program",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "pump_program",
          "address": "6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P"
        },
        {
          "name": "pump_event_authority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  95,
                  95,
                  101,
                  118,
                  101,
                  110,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                1,
                86,
                224,
                246,
                147,
                102,
                90,
                207,
                68,
                219,
                21,
                104,
                191,
                23,
                91,
                170,
                81,
                137,
                203,
                151,
                245,
                210,
                255,
                59,
                101,
                93,
                43,
                182,
                253,
                109,
                24,
                176
              ]
            }
          }
        },
        {
          "name": "pump_amm_program",
          "address": "pAMMBay6oceH9fJKBRHGP5D4bD4sWpmSwMn52FMfXEA"
        },
        {
          "name": "amm_event_authority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  95,
                  95,
                  101,
                  118,
                  101,
                  110,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                12,
                20,
                222,
                252,
                130,
                94,
                198,
                118,
                148,
                37,
                8,
                24,
                187,
                101,
                64,
                101,
                244,
                41,
                141,
                49,
                86,
                213,
                113,
                180,
                212,
                248,
                9,
                12,
                24,
                233,
                168,
                99
              ]
            }
          }
        },
        {
          "name": "quote_mint"
        },
        {
          "name": "token_program"
        },
        {
          "name": "associated_token_program",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "coin_creator_vault_authority",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  114,
                  101,
                  97,
                  116,
                  111,
                  114,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "sharing_config"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                12,
                20,
                222,
                252,
                130,
                94,
                198,
                118,
                148,
                37,
                8,
                24,
                187,
                101,
                64,
                101,
                244,
                41,
                141,
                49,
                86,
                213,
                113,
                180,
                212,
                248,
                9,
                12,
                24,
                233,
                168,
                99
              ]
            }
          }
        },
        {
          "name": "coin_creator_vault_ata",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "coin_creator_vault_authority"
              },
              {
                "kind": "account",
                "path": "token_program"
              },
              {
                "kind": "account",
                "path": "quote_mint"
              }
            ],
            "program": {
              "kind": "account",
              "path": "associated_token_program"
            }
          }
        }
      ],
      "args": [
        {
          "name": "shareholders",
          "type": {
            "vec": {
              "defined": {
                "name": "Shareholder"
              }
            }
          }
        }
      ]
    },
    {
      "name": "update_stable_fee_config",
      "docs": [
        "Set/Replace fee parameters entirely (only callable by admin)"
      ],
      "discriminator": [
        107,
        169,
        100,
        179,
        134,
        155,
        146,
        221
      ],
      "accounts": [
        {
          "name": "fee_config",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  102,
                  101,
                  101,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              },
              {
                "kind": "account",
                "path": "config_program_id"
              }
            ]
          }
        },
        {
          "name": "admin",
          "signer": true,
          "relations": [
            "fee_config"
          ]
        },
        {
          "name": "config_program_id"
        },
        {
          "name": "event_authority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  95,
                  95,
                  101,
                  118,
                  101,
                  110,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "program"
        }
      ],
      "args": [
        {
          "name": "fee_tiers",
          "type": {
            "vec": {
              "defined": {
                "name": "FeeTier"
              }
            }
          }
        }
      ]
    },
    {
      "name": "upsert_fee_tiers",
      "docs": [
        "Update or expand fee tiers (only callable by admin)"
      ],
      "discriminator": [
        227,
        23,
        150,
        12,
        77,
        86,
        94,
        4
      ],
      "accounts": [
        {
          "name": "fee_config",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  102,
                  101,
                  101,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              },
              {
                "kind": "account",
                "path": "config_program_id"
              }
            ]
          }
        },
        {
          "name": "admin",
          "signer": true,
          "relations": [
            "fee_config"
          ]
        },
        {
          "name": "config_program_id"
        },
        {
          "name": "event_authority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  95,
                  95,
                  101,
                  118,
                  101,
                  110,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "program"
        }
      ],
      "args": [
        {
          "name": "fee_tiers",
          "type": {
            "vec": {
              "defined": {
                "name": "FeeTier"
              }
            }
          }
        },
        {
          "name": "offset",
          "type": "u8"
        }
      ]
    },
    {
      "name": "upsert_stable_fee_tiers",
      "docs": [
        "Update or expand fee tiers (only callable by admin)"
      ],
      "discriminator": [
        181,
        160,
        162,
        252,
        74,
        76,
        224,
        221
      ],
      "accounts": [
        {
          "name": "fee_config",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  102,
                  101,
                  101,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              },
              {
                "kind": "account",
                "path": "config_program_id"
              }
            ]
          }
        },
        {
          "name": "admin",
          "signer": true,
          "relations": [
            "fee_config"
          ]
        },
        {
          "name": "config_program_id"
        },
        {
          "name": "event_authority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  95,
                  95,
                  101,
                  118,
                  101,
                  110,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "program"
        }
      ],
      "args": [
        {
          "name": "fee_tiers",
          "type": {
            "vec": {
              "defined": {
                "name": "FeeTier"
              }
            }
          }
        },
        {
          "name": "offset",
          "type": "u8"
        }
      ]
    },
    {
      "name": "withdraw",
      "discriminator": [
        183,
        18,
        70,
        156,
        148,
        109,
        161,
        34
      ],
      "accounts": [
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "referral_vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  101,
                  102,
                  101,
                  114,
                  114,
                  97,
                  108,
                  45,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "user"
              }
            ]
          }
        },
        {
          "name": "quote_mint",
          "optional": true
        },
        {
          "name": "vault_ata",
          "writable": true,
          "optional": true
        },
        {
          "name": "user_ata",
          "writable": true,
          "optional": true
        },
        {
          "name": "token_program",
          "optional": true
        },
        {
          "name": "system_program",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "event_authority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  95,
                  95,
                  101,
                  118,
                  101,
                  110,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "program"
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "BondingCurve",
      "discriminator": [
        23,
        183,
        248,
        55,
        96,
        216,
        172,
        96
      ]
    },
    {
      "name": "BuybackVault",
      "discriminator": [
        153,
        166,
        71,
        144,
        179,
        189,
        137,
        251
      ]
    },
    {
      "name": "DonationFeePda",
      "discriminator": [
        246,
        197,
        96,
        9,
        193,
        30,
        93,
        115
      ]
    },
    {
      "name": "FeeConfig",
      "discriminator": [
        143,
        52,
        146,
        187,
        219,
        123,
        76,
        155
      ]
    },
    {
      "name": "FeeProgramGlobal",
      "discriminator": [
        162,
        165,
        245,
        49,
        29,
        37,
        55,
        242
      ]
    },
    {
      "name": "Global",
      "discriminator": [
        167,
        232,
        232,
        177,
        200,
        108,
        114,
        127
      ]
    },
    {
      "name": "Pool",
      "discriminator": [
        241,
        154,
        109,
        4,
        17,
        177,
        109,
        188
      ]
    },
    {
      "name": "SharingConfig",
      "discriminator": [
        216,
        74,
        9,
        0,
        56,
        140,
        93,
        75
      ]
    },
    {
      "name": "SocialFeePda",
      "discriminator": [
        139,
        96,
        53,
        17,
        42,
        169,
        206,
        150
      ]
    }
  ],
  "events": [
    {
      "name": "CreateFeeSharingConfigEvent",
      "discriminator": [
        133,
        105,
        170,
        200,
        184,
        116,
        251,
        88
      ]
    },
    {
      "name": "DonationFeePdaCranked",
      "discriminator": [
        30,
        208,
        107,
        93,
        177,
        0,
        223,
        78
      ]
    },
    {
      "name": "DonationFeePdaCreated",
      "discriminator": [
        94,
        20,
        137,
        239,
        35,
        77,
        225,
        235
      ]
    },
    {
      "name": "ExtendFeeConfigEvent",
      "discriminator": [
        226,
        203,
        224,
        35,
        153,
        10,
        88,
        51
      ]
    },
    {
      "name": "InitializeFeeConfigEvent",
      "discriminator": [
        89,
        138,
        244,
        230,
        10,
        56,
        226,
        126
      ]
    },
    {
      "name": "InitializeFeeProgramGlobalEvent",
      "discriminator": [
        40,
        233,
        156,
        78,
        95,
        0,
        8,
        199
      ]
    },
    {
      "name": "ResetFeeSharingConfigEvent",
      "discriminator": [
        203,
        204,
        151,
        226,
        120,
        55,
        214,
        243
      ]
    },
    {
      "name": "SetAuthorityEvent",
      "discriminator": [
        18,
        175,
        132,
        66,
        208,
        201,
        87,
        242
      ]
    },
    {
      "name": "SetClaimRateLimitEvent",
      "discriminator": [
        13,
        143,
        143,
        235,
        181,
        19,
        51,
        40
      ]
    },
    {
      "name": "SetDisableFlagsEvent",
      "discriminator": [
        5,
        8,
        179,
        65,
        49,
        55,
        145,
        126
      ]
    },
    {
      "name": "SetExoticFlatFeesEvent",
      "discriminator": [
        195,
        138,
        108,
        15,
        8,
        77,
        68,
        9
      ]
    },
    {
      "name": "SetSocialClaimAuthorityEvent",
      "discriminator": [
        60,
        118,
        127,
        132,
        239,
        52,
        254,
        14
      ]
    },
    {
      "name": "SocialFeePdaClaimed",
      "discriminator": [
        50,
        18,
        193,
        65,
        237,
        210,
        234,
        236
      ]
    },
    {
      "name": "SocialFeePdaCreated",
      "discriminator": [
        183,
        183,
        218,
        147,
        24,
        124,
        137,
        169
      ]
    },
    {
      "name": "SweepBuybackEvent",
      "discriminator": [
        43,
        56,
        42,
        214,
        153,
        57,
        166,
        137
      ]
    },
    {
      "name": "UpdateAdminEvent",
      "discriminator": [
        225,
        152,
        171,
        87,
        246,
        63,
        66,
        234
      ]
    },
    {
      "name": "UpdateFeeConfigEvent",
      "discriminator": [
        90,
        23,
        65,
        35,
        62,
        244,
        188,
        208
      ]
    },
    {
      "name": "UpdateFeeSharesEvent",
      "discriminator": [
        21,
        186,
        196,
        184,
        91,
        228,
        225,
        203
      ]
    },
    {
      "name": "UpdateStableFeeConfigEvent",
      "discriminator": [
        94,
        5,
        43,
        237,
        103,
        147,
        232,
        245
      ]
    },
    {
      "name": "UpsertFeeTiersEvent",
      "discriminator": [
        171,
        89,
        169,
        187,
        122,
        186,
        33,
        204
      ]
    },
    {
      "name": "UpsertStableFeeTiersEvent",
      "discriminator": [
        232,
        237,
        237,
        52,
        98,
        146,
        73,
        243
      ]
    },
    {
      "name": "WithdrawEvent",
      "discriminator": [
        22,
        9,
        133,
        26,
        160,
        44,
        71,
        192
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "UnauthorizedProgram",
      "msg": "Only Pump and PumpSwap programs can call this instruction"
    },
    {
      "code": 6001,
      "name": "InvalidAdmin",
      "msg": "Invalid admin"
    },
    {
      "code": 6002,
      "name": "NoFeeTiers",
      "msg": "No fee tiers provided"
    },
    {
      "code": 6003,
      "name": "TooManyFeeTiers",
      "msg": "format"
    },
    {
      "code": 6004,
      "name": "OffsetNotContinuous",
      "msg": "The offset should be <= fee_config.fee_tiers.len()"
    },
    {
      "code": 6005,
      "name": "FeeTiersNotSorted",
      "msg": "Fee tiers must be sorted by market cap threshold (ascending)"
    },
    {
      "code": 6006,
      "name": "InvalidFeeTotal",
      "msg": "Fee total must not exceed 10_000bps"
    },
    {
      "code": 6007,
      "name": "InvalidSharingConfig",
      "msg": "Invalid Sharing Config"
    },
    {
      "code": 6008,
      "name": "InvalidPool",
      "msg": "Invalid Pool"
    },
    {
      "code": 6009,
      "name": "SharingConfigAdminRevoked",
      "msg": "Sharing config authority has been revoked - sharing config can only be updated once"
    },
    {
      "code": 6010,
      "name": "NoShareholders",
      "msg": "No shareholders provided"
    },
    {
      "code": 6011,
      "name": "TooManyShareholders",
      "msg": "format"
    },
    {
      "code": 6012,
      "name": "DuplicateShareholder",
      "msg": "Duplicate shareholder address"
    },
    {
      "code": 6013,
      "name": "NotEnoughRemainingAccounts",
      "msg": "Not enough remaining accounts"
    },
    {
      "code": 6014,
      "name": "InvalidShareTotal",
      "msg": "Invalid share total - must equal 10_000 basis points"
    },
    {
      "code": 6015,
      "name": "ShareCalculationOverflow",
      "msg": "Share calculation overflow"
    },
    {
      "code": 6016,
      "name": "NotAuthorized",
      "msg": "The given account is not authorized to execute this instruction."
    },
    {
      "code": 6017,
      "name": "ZeroShareNotAllowed",
      "msg": "Shareholder cannot have zero share"
    },
    {
      "code": 6018,
      "name": "SharingConfigNotActive",
      "msg": "Fee sharing config is not active"
    },
    {
      "code": 6019,
      "name": "AmmAccountsRequiredForGraduatedCoin",
      "msg": "AMM accounts are required for graduated coins"
    },
    {
      "code": 6020,
      "name": "ShareholderAccountMismatch",
      "msg": "Remaining account key doesn't match shareholder address"
    },
    {
      "code": 6021,
      "name": "FeatureDeactivated",
      "msg": "Feature is currently deactivated"
    },
    {
      "code": 6022,
      "name": "UserIdTooLong",
      "msg": "User ID exceeds maximum length"
    },
    {
      "code": 6023,
      "name": "DeprecatedInstruction",
      "msg": "Instruction is deprecated"
    },
    {
      "code": 6024,
      "name": "FeeSharesAlreadyUpdated",
      "msg": "Reward split can only be updated once"
    },
    {
      "code": 6025,
      "name": "MathOverflow",
      "msg": "Math overflow"
    },
    {
      "code": 6026,
      "name": "InvalidBuybackIndex",
      "msg": "Invalid buybackindex"
    },
    {
      "code": 6027,
      "name": "ClaimRateLimitExceeded",
      "msg": "Claim rate limit exceeded"
    },
    {
      "code": 6028,
      "name": "InvalidFeeConfigAccount",
      "msg": "Account is not a valid FeeConfig for this instruction"
    },
    {
      "code": 6029,
      "name": "AccountTypeNotSupported",
      "msg": "Account type not supported"
    },
    {
      "code": 6030,
      "name": "InvalidMint",
      "msg": "Mint does not match quote mint"
    },
    {
      "code": 6031,
      "name": "UnsupportedQuoteMint",
      "msg": "Unsupported quote mint"
    },
    {
      "code": 6032,
      "name": "InvalidRemainingAccounts",
      "msg": "Invalid remaining accounts"
    },
    {
      "code": 6033,
      "name": "PoolCreatorFeesNotSwept",
      "msg": "Pool creator_fees must be swept before the shares change"
    },
    {
      "code": 6034,
      "name": "InvalidQuoteMint",
      "msg": "quote_mint is not the bonding curve's quote mint"
    },
    {
      "code": 6035,
      "name": "IncompleteTokenAccounts",
      "msg": "Token withdrawals need quote_mint, vault_ata, user_ata and token_program"
    },
    {
      "code": 6036,
      "name": "NothingToWithdraw",
      "msg": "Nothing to withdraw"
    }
  ],
  "types": [
    {
      "name": "BondingCurve",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "virtual_token_reserves",
            "type": "u64"
          },
          {
            "name": "virtual_quote_reserves",
            "type": "u64"
          },
          {
            "name": "real_token_reserves",
            "type": "u64"
          },
          {
            "name": "real_quote_reserves",
            "type": "u64"
          },
          {
            "name": "token_total_supply",
            "type": "u64"
          },
          {
            "name": "complete",
            "type": "bool"
          },
          {
            "name": "creator",
            "type": "pubkey"
          },
          {
            "name": "is_mayhem_mode",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "BuybackVault",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "pubkey"
          },
          {
            "name": "total_claimed",
            "type": "u64"
          },
          {
            "name": "total_claimed_token1",
            "type": "u64"
          },
          {
            "name": "total_claimed_token2",
            "type": "u64"
          },
          {
            "name": "last_claimed",
            "type": "i64"
          },
          {
            "name": "claim_rate_limit",
            "type": "i64"
          },
          {
            "name": "_reserved",
            "type": {
              "array": [
                "u8",
                128
              ]
            }
          }
        ]
      }
    },
    {
      "name": "ConfigStatus",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Paused"
          },
          {
            "name": "Active"
          }
        ]
      }
    },
    {
      "name": "CreateFeeSharingConfigEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "timestamp",
            "type": "i64"
          },
          {
            "name": "mint",
            "type": "pubkey"
          },
          {
            "name": "bonding_curve",
            "type": "pubkey"
          },
          {
            "name": "pool",
            "type": {
              "option": "pubkey"
            }
          },
          {
            "name": "sharing_config",
            "type": "pubkey"
          },
          {
            "name": "admin",
            "type": "pubkey"
          },
          {
            "name": "initial_shareholders",
            "type": {
              "vec": {
                "defined": {
                  "name": "Shareholder"
                }
              }
            }
          },
          {
            "name": "status",
            "type": {
              "defined": {
                "name": "ConfigStatus"
              }
            }
          }
        ]
      }
    },
    {
      "name": "DonationFeePda",
      "docs": [
        "Escrow PDA for donation relay: one per (mint, donation campaign `config_id`)."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "version",
            "type": "u8"
          },
          {
            "name": "config_id",
            "type": "pubkey"
          },
          {
            "name": "base_mint",
            "type": "pubkey"
          },
          {
            "name": "quote_mint",
            "type": "pubkey"
          },
          {
            "name": "creator",
            "type": "pubkey"
          },
          {
            "name": "total_donated",
            "type": "u64"
          },
          {
            "name": "last_crank_ts",
            "type": "i64"
          },
          {
            "name": "_reserved",
            "type": {
              "array": [
                "u8",
                64
              ]
            }
          }
        ]
      }
    },
    {
      "name": "DonationFeePdaCranked",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "timestamp",
            "type": "i64"
          },
          {
            "name": "signer",
            "type": "pubkey"
          },
          {
            "name": "donation_fee_pda",
            "type": "pubkey"
          },
          {
            "name": "config_id",
            "type": "pubkey"
          },
          {
            "name": "base_mint",
            "type": "pubkey"
          },
          {
            "name": "quote_mint",
            "type": "pubkey"
          },
          {
            "name": "creator",
            "type": "pubkey"
          },
          {
            "name": "amount",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "DonationFeePdaCreated",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "timestamp",
            "type": "i64"
          },
          {
            "name": "created_by",
            "type": "pubkey"
          },
          {
            "name": "donation_fee_pda",
            "type": "pubkey"
          },
          {
            "name": "config_id",
            "type": "pubkey"
          },
          {
            "name": "base_mint",
            "type": "pubkey"
          },
          {
            "name": "quote_mint",
            "type": "pubkey"
          },
          {
            "name": "creator",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "ExtendFeeConfigEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "fee_config",
            "type": "pubkey"
          },
          {
            "name": "user",
            "type": "pubkey"
          },
          {
            "name": "current_size",
            "type": "u64"
          },
          {
            "name": "new_size",
            "type": "u64"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "FeeConfig",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bump",
            "docs": [
              "The bump for the PDA"
            ],
            "type": "u8"
          },
          {
            "name": "admin",
            "docs": [
              "The admin account that can update the fee config"
            ],
            "type": "pubkey"
          },
          {
            "name": "flat_fees",
            "docs": [
              "The flat fees for non-pump pools"
            ],
            "type": {
              "defined": {
                "name": "Fees"
              }
            }
          },
          {
            "name": "fee_tiers",
            "docs": [
              "The fee tiers"
            ],
            "type": {
              "vec": {
                "defined": {
                  "name": "FeeTier"
                }
              }
            }
          },
          {
            "name": "stable_fee_tiers",
            "docs": [
              "The fee tiers"
            ],
            "type": {
              "vec": {
                "defined": {
                  "name": "FeeTier"
                }
              }
            }
          },
          {
            "name": "exotic_flat_fees",
            "type": {
              "defined": {
                "name": "Fees"
              }
            }
          }
        ]
      }
    },
    {
      "name": "FeeProgramGlobal",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "authority",
            "type": "pubkey"
          },
          {
            "name": "disable_flags",
            "type": "u8"
          },
          {
            "name": "social_claim_authority",
            "type": "pubkey"
          },
          {
            "name": "claim_rate_limit",
            "type": "u64"
          },
          {
            "name": "_reserved",
            "type": {
              "array": [
                "u8",
                256
              ]
            }
          }
        ]
      }
    },
    {
      "name": "FeeTier",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "market_cap_lamports_threshold",
            "type": "u128"
          },
          {
            "name": "fees",
            "type": {
              "defined": {
                "name": "Fees"
              }
            }
          }
        ]
      }
    },
    {
      "name": "Fees",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "lp_fee_bps",
            "type": "u64"
          },
          {
            "name": "protocol_fee_bps",
            "type": "u64"
          },
          {
            "name": "creator_fee_bps",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "Global",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "initialized",
            "type": "bool"
          },
          {
            "name": "authority",
            "type": "pubkey"
          },
          {
            "name": "fee_recipient",
            "type": "pubkey"
          },
          {
            "name": "initial_virtual_token_reserves",
            "type": "u64"
          },
          {
            "name": "initial_virtual_sol_reserves",
            "type": "u64"
          },
          {
            "name": "initial_real_token_reserves",
            "type": "u64"
          },
          {
            "name": "token_total_supply",
            "type": "u64"
          },
          {
            "name": "fee_basis_points",
            "type": "u64"
          },
          {
            "name": "withdraw_authority",
            "type": "pubkey"
          },
          {
            "name": "enable_migrate",
            "type": "bool"
          },
          {
            "name": "pool_migration_fee",
            "type": "u64"
          },
          {
            "name": "creator_fee_basis_points",
            "type": "u64"
          },
          {
            "name": "fee_recipients",
            "type": {
              "array": [
                "pubkey",
                7
              ]
            }
          },
          {
            "name": "set_creator_authority",
            "type": "pubkey"
          },
          {
            "name": "admin_set_creator_authority",
            "type": "pubkey"
          },
          {
            "name": "create_v2_enabled",
            "type": "bool"
          },
          {
            "name": "whitelist_pda",
            "type": "pubkey"
          },
          {
            "name": "reserved_fee_recipient",
            "type": "pubkey"
          },
          {
            "name": "mayhem_mode_enabled",
            "type": "bool"
          },
          {
            "name": "reserved_fee_recipients",
            "type": {
              "array": [
                "pubkey",
                7
              ]
            }
          }
        ]
      }
    },
    {
      "name": "InitializeFeeConfigEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "timestamp",
            "type": "i64"
          },
          {
            "name": "admin",
            "type": "pubkey"
          },
          {
            "name": "fee_config",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "InitializeFeeProgramGlobalEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "timestamp",
            "type": "i64"
          },
          {
            "name": "authority",
            "type": "pubkey"
          },
          {
            "name": "social_claim_authority",
            "type": "pubkey"
          },
          {
            "name": "disable_flags",
            "type": "u8"
          },
          {
            "name": "claim_rate_limit",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "OptionBool",
      "type": {
        "kind": "struct",
        "fields": [
          "bool"
        ]
      }
    },
    {
      "name": "Pool",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "pool_bump",
            "type": "u8"
          },
          {
            "name": "index",
            "type": "u16"
          },
          {
            "name": "creator",
            "type": "pubkey"
          },
          {
            "name": "base_mint",
            "type": "pubkey"
          },
          {
            "name": "quote_mint",
            "type": "pubkey"
          },
          {
            "name": "lp_mint",
            "type": "pubkey"
          },
          {
            "name": "pool_base_token_account",
            "type": "pubkey"
          },
          {
            "name": "pool_quote_token_account",
            "type": "pubkey"
          },
          {
            "name": "lp_supply",
            "type": "u64"
          },
          {
            "name": "coin_creator",
            "type": "pubkey"
          },
          {
            "name": "is_mayhem_mode",
            "type": "bool"
          },
          {
            "name": "is_cashback_coin",
            "type": "bool"
          },
          {
            "name": "virtual_quote_reserves",
            "type": "i128"
          }
        ]
      }
    },
    {
      "name": "ResetFeeSharingConfigEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "timestamp",
            "type": "i64"
          },
          {
            "name": "mint",
            "type": "pubkey"
          },
          {
            "name": "sharing_config",
            "type": "pubkey"
          },
          {
            "name": "old_admin",
            "type": "pubkey"
          },
          {
            "name": "old_shareholders",
            "type": {
              "vec": {
                "defined": {
                  "name": "Shareholder"
                }
              }
            }
          },
          {
            "name": "new_admin",
            "type": "pubkey"
          },
          {
            "name": "new_shareholders",
            "type": {
              "vec": {
                "defined": {
                  "name": "Shareholder"
                }
              }
            }
          },
          {
            "name": "old_version",
            "type": "u8"
          },
          {
            "name": "new_version",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "SetAuthorityEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "timestamp",
            "type": "i64"
          },
          {
            "name": "old_authority",
            "type": "pubkey"
          },
          {
            "name": "new_authority",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "SetClaimRateLimitEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "timestamp",
            "type": "i64"
          },
          {
            "name": "claim_rate_limit",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "SetDisableFlagsEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "timestamp",
            "type": "i64"
          },
          {
            "name": "disable_flags",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "SetExoticFlatFeesEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "timestamp",
            "type": "i64"
          },
          {
            "name": "admin",
            "type": "pubkey"
          },
          {
            "name": "fee_config",
            "type": "pubkey"
          },
          {
            "name": "exotic_flat_fees",
            "type": {
              "defined": {
                "name": "Fees"
              }
            }
          }
        ]
      }
    },
    {
      "name": "SetSocialClaimAuthorityEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "timestamp",
            "type": "i64"
          },
          {
            "name": "social_claim_authority",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "Shareholder",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "address",
            "type": "pubkey"
          },
          {
            "name": "share_bps",
            "type": "u16"
          }
        ]
      }
    },
    {
      "name": "SharingConfig",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "version",
            "type": "u8"
          },
          {
            "name": "status",
            "type": {
              "defined": {
                "name": "ConfigStatus"
              }
            }
          },
          {
            "name": "mint",
            "type": "pubkey"
          },
          {
            "name": "admin",
            "type": "pubkey"
          },
          {
            "name": "admin_revoked",
            "type": "bool"
          },
          {
            "name": "shareholders",
            "type": {
              "vec": {
                "defined": {
                  "name": "Shareholder"
                }
              }
            }
          }
        ]
      }
    },
    {
      "name": "SocialFeePda",
      "docs": [
        "Platform identifier: 0=pump, 1=twitter, etc."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "version",
            "type": "u8"
          },
          {
            "name": "user_id",
            "docs": [
              "Max 20 characters to fit u64::MAX (18,446,744,073,709,551,615) as a string.",
              "Actual storage: 4 bytes (length prefix) + 20 bytes (content) = 24 bytes."
            ],
            "type": "string"
          },
          {
            "name": "platform",
            "type": "u8"
          },
          {
            "name": "total_claimed",
            "type": "u64"
          },
          {
            "name": "last_claimed",
            "type": "u64"
          },
          {
            "name": "total_stable_claimed",
            "type": "u64"
          },
          {
            "name": "_reserved",
            "type": {
              "array": [
                "u8",
                120
              ]
            }
          }
        ]
      }
    },
    {
      "name": "SocialFeePdaClaimed",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "timestamp",
            "type": "i64"
          },
          {
            "name": "user_id",
            "type": "string"
          },
          {
            "name": "platform",
            "type": "u8"
          },
          {
            "name": "social_fee_pda",
            "type": "pubkey"
          },
          {
            "name": "recipient",
            "type": "pubkey"
          },
          {
            "name": "social_claim_authority",
            "type": "pubkey"
          },
          {
            "name": "amount_claimed",
            "type": "u64"
          },
          {
            "name": "claimable_before",
            "type": "u64"
          },
          {
            "name": "lifetime_claimed",
            "type": "u64"
          },
          {
            "name": "recipient_balance_before",
            "type": "u64"
          },
          {
            "name": "recipient_balance_after",
            "type": "u64"
          },
          {
            "name": "quote_mint",
            "type": "pubkey"
          },
          {
            "name": "lifetime_stable_claimed",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "SocialFeePdaCreated",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "timestamp",
            "type": "i64"
          },
          {
            "name": "user_id",
            "type": "string"
          },
          {
            "name": "platform",
            "type": "u8"
          },
          {
            "name": "social_fee_pda",
            "type": "pubkey"
          },
          {
            "name": "created_by",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "SweepBuybackEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "index",
            "type": "u8"
          },
          {
            "name": "sol_amount",
            "type": "u64"
          },
          {
            "name": "token_amount",
            "type": "u64"
          },
          {
            "name": "destination",
            "type": "pubkey"
          },
          {
            "name": "buyback_vault",
            "type": "pubkey"
          },
          {
            "name": "mint",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "UpdateAdminEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "timestamp",
            "type": "i64"
          },
          {
            "name": "old_admin",
            "type": "pubkey"
          },
          {
            "name": "new_admin",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "UpdateFeeConfigEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "timestamp",
            "type": "i64"
          },
          {
            "name": "admin",
            "type": "pubkey"
          },
          {
            "name": "fee_config",
            "type": "pubkey"
          },
          {
            "name": "fee_tiers",
            "type": {
              "vec": {
                "defined": {
                  "name": "FeeTier"
                }
              }
            }
          },
          {
            "name": "flat_fees",
            "type": {
              "defined": {
                "name": "Fees"
              }
            }
          }
        ]
      }
    },
    {
      "name": "UpdateFeeSharesEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "timestamp",
            "type": "i64"
          },
          {
            "name": "mint",
            "type": "pubkey"
          },
          {
            "name": "sharing_config",
            "type": "pubkey"
          },
          {
            "name": "admin",
            "type": "pubkey"
          },
          {
            "name": "new_shareholders",
            "type": {
              "vec": {
                "defined": {
                  "name": "Shareholder"
                }
              }
            }
          },
          {
            "name": "version",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "UpdateStableFeeConfigEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "timestamp",
            "type": "i64"
          },
          {
            "name": "admin",
            "type": "pubkey"
          },
          {
            "name": "fee_config",
            "type": "pubkey"
          },
          {
            "name": "stable_fee_tiers",
            "type": {
              "vec": {
                "defined": {
                  "name": "FeeTier"
                }
              }
            }
          },
          {
            "name": "flat_fees",
            "type": {
              "defined": {
                "name": "Fees"
              }
            }
          }
        ]
      }
    },
    {
      "name": "UpsertFeeTiersEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "timestamp",
            "type": "i64"
          },
          {
            "name": "admin",
            "type": "pubkey"
          },
          {
            "name": "fee_config",
            "type": "pubkey"
          },
          {
            "name": "fee_tiers",
            "type": {
              "vec": {
                "defined": {
                  "name": "FeeTier"
                }
              }
            }
          },
          {
            "name": "offset",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "UpsertStableFeeTiersEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "timestamp",
            "type": "i64"
          },
          {
            "name": "admin",
            "type": "pubkey"
          },
          {
            "name": "fee_config",
            "type": "pubkey"
          },
          {
            "name": "stable_fee_tiers",
            "type": {
              "vec": {
                "defined": {
                  "name": "FeeTier"
                }
              }
            }
          },
          {
            "name": "offset",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "WithdrawEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "timestamp",
            "type": "i64"
          },
          {
            "name": "user",
            "type": "pubkey"
          },
          {
            "name": "quote_mint",
            "type": "pubkey"
          },
          {
            "name": "amount",
            "type": "u64"
          }
        ]
      }
    }
  ],
  "constants": [
    {
      "name": "AMM_CREATOR_VAULT_AUTHORITY_SEED",
      "type": {
        "array": [
          "u8",
          13
        ]
      },
      "value": "[99, 114, 101, 97, 116, 111, 114, 95, 118, 97, 117, 108, 116]"
    },
    {
      "name": "BUYBACK_VAULT_SEED",
      "type": {
        "array": [
          "u8",
          13
        ]
      },
      "value": "[98, 117, 121, 98, 97, 99, 107, 45, 118, 97, 117, 108, 116]"
    },
    {
      "name": "DEBOUNCER_V1",
      "type": "bytes",
      "value": "[100, 101, 98, 111, 117, 110, 99, 101, 114, 95, 118, 49]"
    },
    {
      "name": "DONATION_FEE_PDA_SEED",
      "type": {
        "array": [
          "u8",
          16
        ]
      },
      "value": "[100, 111, 110, 97, 116, 105, 111, 110, 45, 102, 101, 101, 45, 112, 100, 97]"
    },
    {
      "name": "EPOCH_TRACKER_V1",
      "type": "bytes",
      "value": "[101, 112, 111, 99, 104, 95, 116, 114, 97, 99, 107, 101, 114, 95, 118, 49]"
    },
    {
      "name": "FEE_CONFIG_SEED",
      "type": "bytes",
      "value": "[102, 101, 101, 95, 99, 111, 110, 102, 105, 103]"
    },
    {
      "name": "FEE_PROGRAM_GLOBAL_SEED",
      "type": {
        "array": [
          "u8",
          18
        ]
      },
      "value": "[102, 101, 101, 45, 112, 114, 111, 103, 114, 97, 109, 45, 103, 108, 111, 98, 97, 108]"
    },
    {
      "name": "IX_DONATE_PUBKEY_CONFIG_ID_WITH_PAYER_V1",
      "type": {
        "array": [
          "u8",
          8
        ]
      },
      "value": "[120, 217, 57, 241, 135, 104, 139, 184]"
    },
    {
      "name": "MAX_BUYBACK_INDEX",
      "type": "u8",
      "value": "8"
    },
    {
      "name": "MINT_WHITELIST_V1",
      "type": "bytes",
      "value": "[109, 105, 110, 116, 95, 119, 104, 105, 116, 101, 108, 105, 115, 116, 95, 118, 49]"
    },
    {
      "name": "PUMP_CREATOR_VAULT_SEED",
      "type": {
        "array": [
          "u8",
          13
        ]
      },
      "value": "[99, 114, 101, 97, 116, 111, 114, 45, 118, 97, 117, 108, 116]"
    },
    {
      "name": "PUMP_GLOBAL_SEED",
      "docs": [
        "Bonding Curve Program Global Seed"
      ],
      "type": {
        "array": [
          "u8",
          6
        ]
      },
      "value": "[103, 108, 111, 98, 97, 108]"
    },
    {
      "name": "SHARING_CONFIG_SEED",
      "type": {
        "array": [
          "u8",
          14
        ]
      },
      "value": "[115, 104, 97, 114, 105, 110, 103, 45, 99, 111, 110, 102, 105, 103]"
    },
    {
      "name": "SOCIAL_FEE_PDA_SEED",
      "type": {
        "array": [
          "u8",
          14
        ]
      },
      "value": "[115, 111, 99, 105, 97, 108, 45, 102, 101, 101, 45, 112, 100, 97]"
    }
  ]
};
